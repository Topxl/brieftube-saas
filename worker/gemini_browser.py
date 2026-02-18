"""Gemini browser automation for video summarization.

Reused from the original BriefTube bot with minimal changes.
Uses Playwright to automate Gemini in a headless browser.
"""

import asyncio
import json
import logging
from pathlib import Path
from playwright.async_api import async_playwright, BrowserContext, Page

from config import COOKIES_FILE, COOKIES_DIR

logger = logging.getLogger(__name__)

GEMINI_URL = "https://gemini.google.com/app"
BROWSER_PROFILE_DIR = COOKIES_DIR / "browser_profile"


class SessionExpiredError(Exception):
    pass


class GeminiSummarizer:
    RESTART_EVERY = 50

    def __init__(self):
        self.context: BrowserContext = None
        self.playwright = None
        self._summary_count = 0

    async def _load_cookies(self) -> list[dict]:
        if not COOKIES_FILE.exists():
            raise FileNotFoundError(
                f"Cookies file not found: {COOKIES_FILE}\n"
                "Run 'python scripts/save_cookies.py' to save your Gemini session."
            )
        with open(COOKIES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    async def start(self) -> None:
        self.playwright = await async_playwright().start()
        BROWSER_PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        self.context = await self.playwright.chromium.launch_persistent_context(
            user_data_dir=str(BROWSER_PROFILE_DIR),
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
            viewport={"width": 1280, "height": 800},
            locale="fr-FR",
        )

    async def stop(self) -> None:
        if self.context:
            await self.context.close()
        if self.playwright:
            await self.playwright.stop()

    async def _wait_for_response_complete(self, page: Page, timeout: int = 240) -> bool:
        try:
            logger.info("Waiting for Gemini response...")
            generation_started = False
            start_wait = 20

            for i in range(start_wait * 2):
                stop_selectors = [
                    'button[aria-label="Stop"]',
                    'button[aria-label="Arrêter"]',
                    'button[aria-label="Stop generating"]',
                    'button[aria-label="Arrêter la génération"]',
                ]
                for selector in stop_selectors:
                    try:
                        stop_btn = await page.query_selector(selector)
                        if stop_btn and await stop_btn.is_visible():
                            generation_started = True
                            break
                    except Exception:
                        continue
                if generation_started:
                    break
                try:
                    responses = await page.query_selector_all('message-content')
                    if responses:
                        text = await responses[-1].inner_text()
                        if len(text) > 50:
                            generation_started = True
                            break
                except Exception:
                    pass
                await asyncio.sleep(0.5)

            last_text_length = 0
            stable_count = 0

            for i in range(timeout * 2):
                try:
                    responses = await page.query_selector_all('message-content')
                    if responses:
                        text = await responses[-1].inner_text()
                        current_length = len(text)
                        if current_length > 500:
                            if current_length == last_text_length:
                                stable_count += 1
                                if stable_count >= 8:
                                    logger.info(f"Response complete ({current_length} chars) after {i * 0.5:.1f}s")
                                    return True
                            else:
                                stable_count = 0
                                last_text_length = current_length
                        elif current_length > 50:
                            if current_length == last_text_length:
                                stable_count += 1
                            else:
                                stable_count = 0
                                last_text_length = current_length
                except Exception:
                    pass

                if generation_started and last_text_length > 500:
                    send_selectors = [
                        'button[aria-label="Send message"]',
                        'button[aria-label="Envoyer le message"]',
                        'button[aria-label="Envoyer"]',
                    ]
                    for selector in send_selectors:
                        try:
                            send_btn = await page.query_selector(selector)
                            if send_btn and await send_btn.is_visible():
                                stop_visible = False
                                for stop_sel in stop_selectors:
                                    s = await page.query_selector(stop_sel)
                                    if s and await s.is_visible():
                                        stop_visible = True
                                        break
                                if not stop_visible:
                                    logger.info(f"Response complete (send button) after {i * 0.5:.1f}s")
                                    return True
                        except Exception:
                            continue

                if i > 0 and i % 120 == 0:
                    logger.info(f"Still waiting... ({i * 0.5:.0f}s, length={last_text_length})")
                await asyncio.sleep(0.5)

            logger.warning("Timeout waiting for Gemini response")
            return False
        except Exception as e:
            logger.error(f"Error waiting for response: {e}")
            return False

    async def _extract_response(self, page: Page) -> str:
        MIN_SUMMARY_LENGTH = 500
        SIDEBAR_KEYWORDS = [
            'Nouvelle discussion', 'New chat', 'Mes contenus',
            'Gems', 'Discussions', 'Paramètres', 'Settings',
        ]

        def is_sidebar(text):
            return sum(1 for kw in SIDEBAR_KEYWORDS if kw in text) >= 2

        selectors = [
            'message-content.model-response-text',
            'message-content .markdown-main-panel',
            'message-content',
            '.model-response-text',
        ]
        for selector in selectors:
            try:
                responses = await page.query_selector_all(selector)
                if responses:
                    text = (await responses[-1].inner_text()).strip()
                    if is_sidebar(text):
                        continue
                    if text and len(text) >= MIN_SUMMARY_LENGTH:
                        lines = text.split('\n')
                        if len([l for l in lines if len(l) > 30]) > 2:
                            return text
            except Exception:
                continue
        logger.warning("Could not extract Gemini response")
        return ""

    async def _ensure_browser_alive(self) -> None:
        if not self.context:
            await self.start()
            return
        try:
            _ = self.context.pages
        except Exception:
            self.context = None
            self.playwright = None
            await self.start()

    async def _restart_browser(self) -> None:
        logger.info("Restarting browser...")
        await self.stop()
        self.context = None
        self.playwright = None
        await self.start()
        self._summary_count = 0

    async def _delete_conversation(self, page: Page) -> bool:
        try:
            logger.info("Deleting conversation...")
            menu_clicked = False

            # Find 3-dot menu in top-right header
            menu_selectors = [
                'button[aria-label="Autres options"]',
                'button[aria-label="More options"]',
                'button[aria-label*="options"]',
            ]
            for selector in menu_selectors:
                try:
                    btns = await page.query_selector_all(selector)
                    for btn in btns:
                        if await btn.is_visible():
                            box = await btn.bounding_box()
                            if box and box['y'] < 80 and box['x'] > 1100:
                                await btn.click()
                                menu_clicked = True
                                break
                    if menu_clicked:
                        break
                except Exception:
                    continue

            if not menu_clicked:
                try:
                    btns = await page.query_selector_all('button')
                    for btn in btns:
                        try:
                            if not await btn.is_visible():
                                continue
                            box = await btn.bounding_box()
                            if not box or box['y'] > 80 or box['x'] < 1100:
                                continue
                            inner = await btn.inner_html()
                            if 'more_vert' in inner:
                                await btn.click()
                                menu_clicked = True
                                break
                        except Exception:
                            continue
                except Exception:
                    pass

            if not menu_clicked:
                logger.warning("Could not find 3-dot menu")
                return False

            await asyncio.sleep(1.5)

            # Click "Supprimer"
            delete_clicked = False
            for selector in [
                'button:has-text("Supprimer")', 'button:has-text("Delete")',
                '[role="menuitem"]:has-text("Supprimer")', '[role="menuitem"]:has-text("Delete")',
                '[mat-menu-item]:has-text("Supprimer")', '[mat-menu-item]:has-text("Delete")',
            ]:
                try:
                    items = await page.query_selector_all(selector)
                    for item in items:
                        if await item.is_visible():
                            text = await item.inner_text()
                            if 'supprimer' in text.strip().lower() or 'delete' in text.strip().lower():
                                await item.click()
                                delete_clicked = True
                                break
                    if delete_clicked:
                        break
                except Exception:
                    continue

            if not delete_clicked:
                await page.keyboard.press("Escape")
                return False

            await asyncio.sleep(1)

            # Confirm deletion
            for selector in [
                'button:has-text("Supprimer")', 'button:has-text("Delete")',
                '[mat-dialog-actions] button:has-text("Supprimer")',
            ]:
                try:
                    items = await page.query_selector_all(selector)
                    for item in items:
                        if await item.is_visible():
                            await item.click()
                            logger.info("Conversation deleted")
                            await asyncio.sleep(2)
                            return True
                except Exception:
                    continue

            return False
        except Exception as e:
            logger.warning(f"Error deleting conversation: {e}")
            return False

    async def summarize(self, youtube_url: str) -> str:
        if self._summary_count >= self.RESTART_EVERY:
            await self._restart_browser()

        await self._ensure_browser_alive()

        try:
            page = await self.context.new_page()
        except Exception:
            self.context = None
            self.playwright = None
            await self.start()
            page = await self.context.new_page()

        try:
            await page.goto(f"{GEMINI_URL}?hl=fr", wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)

            # Check session
            if 'accounts.google.com' in page.url or 'signin' in page.url:
                raise SessionExpiredError("Session expired")

            # Click New Chat
            for selector in [
                'button[aria-label="Nouvelle discussion"]',
                'button[aria-label="New chat"]',
            ]:
                try:
                    btn = await page.query_selector(selector)
                    if btn and await btn.is_visible():
                        await btn.click()
                        await asyncio.sleep(2)
                        break
                except Exception:
                    continue

            await asyncio.sleep(2)

            # Find input field
            input_field = None
            for selector in [
                'rich-textarea div[contenteditable="true"]',
                'div[contenteditable="true"][aria-label]',
                'div[contenteditable="true"]',
            ]:
                try:
                    input_field = await page.wait_for_selector(selector, timeout=10000)
                    if input_field and await input_field.is_visible():
                        break
                except Exception:
                    continue

            if not input_field:
                raise Exception("Could not find input field")

            prompt = f"Fais un résumé détaillé de cette vidéo YouTube: {youtube_url}"

            # Send message (retry up to 3 times)
            message_sent = False
            for attempt in range(3):
                await input_field.click()
                await asyncio.sleep(0.5)
                await page.keyboard.press("Control+a")
                await input_field.type(prompt, delay=10)
                await asyncio.sleep(1)

                # Try send button
                for sel in [
                    'button[aria-label="Envoyer le message"]',
                    'button[aria-label="Send message"]',
                    'button[aria-label="Envoyer"]',
                    'button[aria-label="Send"]',
                ]:
                    try:
                        btn = await page.query_selector(sel)
                        if btn and await btn.is_visible():
                            await btn.click()
                            message_sent = True
                            break
                    except Exception:
                        continue

                if not message_sent:
                    # Try position-based button search
                    buttons = await page.query_selector_all('button')
                    for btn in buttons:
                        try:
                            if not await btn.is_visible():
                                continue
                            box = await btn.bounding_box()
                            if box and box['y'] > 600 and box['x'] > 1000 and box['width'] < 80:
                                await btn.click()
                                message_sent = True
                                break
                        except Exception:
                            continue

                if not message_sent:
                    await page.keyboard.press("Control+Enter")

                await asyncio.sleep(2)
                try:
                    txt = await input_field.inner_text()
                    if not txt or len(txt) < 10:
                        message_sent = True
                except Exception:
                    pass

                if message_sent:
                    break

            if not message_sent:
                raise Exception("Failed to send message")

            # Wait for response
            await asyncio.sleep(5)

            # Wait for video analysis (up to 120s)
            for i in range(120):
                try:
                    responses = await page.query_selector_all('message-content')
                    if responses:
                        text = await responses[-1].inner_text()
                        if len(text) > 100:
                            break
                except Exception:
                    pass
                await asyncio.sleep(1)

            success = await self._wait_for_response_complete(page, timeout=240)
            if not success:
                logger.warning("Timeout - trying to extract anyway")

            await asyncio.sleep(2)
            summary = await self._extract_response(page)

            if not summary:
                raise Exception("Failed to extract summary")

            await self._delete_conversation(page)
            self._summary_count += 1
            return summary

        except Exception as e:
            logger.error(f"Summarize failed: {e}")
            raise
        finally:
            await page.close()


gemini = GeminiSummarizer()
