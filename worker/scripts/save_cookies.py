#!/usr/bin/env python3
"""
Save Gemini session cookies.

Run this script ONCE to log into Google/Gemini manually.
The browser profile will be saved and reused by the worker.

Usage:
    python scripts/save_cookies.py
"""

import asyncio
import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).parent.parent))

from playwright.async_api import async_playwright
from config import BROWSER_PROFILE_DIR


async def main():
    BROWSER_PROFILE_DIR.mkdir(parents=True, exist_ok=True)

    print("Opening browser... Log into your Google account on Gemini.")
    print(f"Profile will be saved to: {BROWSER_PROFILE_DIR}")
    print()

    pw = await async_playwright().start()
    context = await pw.chromium.launch_persistent_context(
        user_data_dir=str(BROWSER_PROFILE_DIR),
        headless=False,  # Show browser for manual login
        args=["--disable-blink-features=AutomationControlled"],
        viewport={"width": 1280, "height": 800},
        locale="fr-FR",
    )

    page = context.pages[0] if context.pages else await context.new_page()
    await page.goto("https://gemini.google.com/app?hl=fr")

    print()
    print("=" * 50)
    print("Log into your Google account in the browser.")
    print("Once you see the Gemini chat page, press Enter here.")
    print("=" * 50)
    input()

    await context.close()
    await pw.stop()

    print()
    print("Session saved! The worker will use this profile.")
    print("You can now start the worker with: python main.py")


if __name__ == "__main__":
    asyncio.run(main())
