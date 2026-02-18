#!/usr/bin/env python3
"""
BriefTube Log Bot — dedicated Telegram bot for worker log monitoring.

Standalone script, runs independently from the main worker.

Setup:
1. Create a new bot via @BotFather → copy the token
2. Add LOG_BOT_TOKEN and LOG_BOT_ADMIN_CHAT_ID to your worker/.env
3. Run: python log_bot.py

Commands:
    /start          — Welcome + command list
    /logs [n]       — Last N lines of worker.log (default 50, max 200)
    /errors [n]     — Last N ERROR/WARNING lines (default 20)
    /status         — System info (CPU, RAM, disk, log file size)
    /watch [s]      — Stream new log lines every S seconds (default 30, min 10)
    /stop           — Stop streaming
"""

import asyncio
import logging
import os
from collections import deque
from pathlib import Path

import psutil
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────

LOG_FILE = Path(__file__).parent / "worker.log"
LOG_BOT_TOKEN = os.getenv("LOG_BOT_TOKEN", "")
LOG_BOT_ADMIN_CHAT_ID = os.getenv("LOG_BOT_ADMIN_CHAT_ID", "")

DEFAULT_LINES = 50
MAX_LINES = 200
MAX_TG_CHARS = 3900  # Telegram limit is 4096, keep some margin

# ── Logging ────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s %(message)s",
)
logger = logging.getLogger("log_bot")

# ── Watch state ────────────────────────────────────────────────────

# chat_id → last byte offset in log file
_watchers: dict[str, int] = {}
# chat_id → asyncio Task
_watch_tasks: dict[str, asyncio.Task] = {}


# ── Helpers ────────────────────────────────────────────────────────

def _is_admin(chat_id: str) -> bool:
    return bool(LOG_BOT_ADMIN_CHAT_ID) and chat_id == str(LOG_BOT_ADMIN_CHAT_ID)


def _tail(n: int) -> str:
    """Return the last N lines of worker.log."""
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
            lines = deque(f, maxlen=n)
        return "".join(lines) or "(log empty)"
    except FileNotFoundError:
        return "worker.log not found — is the worker running?"
    except Exception as e:
        return f"Error reading log: {e}"


def _tail_errors(n: int) -> str:
    """Return the last N lines containing ERROR or WARNING."""
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="replace") as f:
            error_lines = [l for l in f if " ERROR " in l or " WARNING " in l]
        tail = error_lines[-n:] if len(error_lines) > n else error_lines
        return "".join(tail) or "No errors or warnings found."
    except FileNotFoundError:
        return "worker.log not found."
    except Exception as e:
        return f"Error reading log: {e}"


def _get_file_size() -> int:
    """Return current log file size in bytes, 0 if missing."""
    try:
        return LOG_FILE.stat().st_size
    except Exception:
        return 0


def _read_new_lines(offset: int) -> tuple[str, int]:
    """Read bytes written since offset. Returns (new_text, new_offset)."""
    try:
        size = _get_file_size()
        if size <= offset:
            return "", offset
        with open(LOG_FILE, "rb") as f:
            f.seek(offset)
            new_bytes = f.read()
        return new_bytes.decode("utf-8", errors="replace"), size
    except Exception as e:
        return f"Error: {e}", offset


def _truncate(text: str) -> str:
    """Keep only the tail if the text exceeds Telegram's limit."""
    if len(text) <= MAX_TG_CHARS:
        return text
    return "...(truncated)\n" + text[-MAX_TG_CHARS:]


def _get_system_info() -> str:
    """Return a short system resource summary."""
    try:
        cpu = psutil.cpu_percent(interval=0.2)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        return (
            f"CPU: {cpu}%\n"
            f"RAM: {mem.percent}%  ({mem.used // 1024 // 1024} MB / {mem.total // 1024 // 1024} MB)\n"
            f"Disk: {disk.free // 1024 // 1024 // 1024} GB free  ({disk.percent}% used)"
        )
    except Exception as e:
        return f"System info unavailable: {e}"


# ── Command handlers ────────────────────────────────────────────────

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    if not _is_admin(chat_id):
        await update.message.reply_text(
            f"Access denied.\n\nYour chat ID: {chat_id}\n"
            "Set LOG_BOT_ADMIN_CHAT_ID in worker/.env to allow access."
        )
        return

    await update.message.reply_text(
        "BriefTube Log Bot\n\n"
        "Commands:\n"
        "/logs [n]    — Last N lines (default 50)\n"
        "/errors [n]  — Last N ERROR/WARNING lines (default 20)\n"
        "/status      — System info\n"
        "/watch [s]   — Stream new lines every S seconds (default 30)\n"
        "/stop        — Stop streaming"
    )


async def logs_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    if not _is_admin(chat_id):
        await update.message.reply_text("Access denied.")
        return

    n = DEFAULT_LINES
    if context.args and context.args[0].isdigit():
        n = min(int(context.args[0]), MAX_LINES)

    text = _tail(n)
    await update.message.reply_text(
        f"```\n{_truncate(text)}\n```",
        parse_mode="Markdown",
    )


async def errors_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    if not _is_admin(chat_id):
        await update.message.reply_text("Access denied.")
        return

    n = 20
    if context.args and context.args[0].isdigit():
        n = min(int(context.args[0]), 100)

    text = _tail_errors(n)
    await update.message.reply_text(
        f"```\n{_truncate(text)}\n```",
        parse_mode="Markdown",
    )


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    if not _is_admin(chat_id):
        await update.message.reply_text("Access denied.")
        return

    size_kb = _get_file_size() // 1024
    watching = chat_id in _watchers

    text = (
        f"System\n{_get_system_info()}\n\n"
        f"Log file: {size_kb} KB\n"
        f"Streaming: {'active' if watching else 'off'}"
    )
    await update.message.reply_text(text)


async def watch_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    if not _is_admin(chat_id):
        await update.message.reply_text("Access denied.")
        return

    if chat_id in _watch_tasks and not _watch_tasks[chat_id].done():
        await update.message.reply_text(
            "Already streaming. Use /stop to stop first."
        )
        return

    interval = 30
    if context.args and context.args[0].isdigit():
        interval = max(10, min(int(context.args[0]), 300))

    # Start from the current end of file — only new lines will be sent.
    _watchers[chat_id] = _get_file_size()
    await update.message.reply_text(
        f"Streaming worker.log every {interval}s.\nUse /stop to stop."
    )

    async def _watch_loop() -> None:
        while chat_id in _watchers:
            await asyncio.sleep(interval)
            if chat_id not in _watchers:
                break
            new_text, new_offset = _read_new_lines(_watchers[chat_id])
            _watchers[chat_id] = new_offset
            if new_text.strip():
                try:
                    await context.bot.send_message(
                        chat_id=chat_id,
                        text=f"```\n{_truncate(new_text)}\n```",
                        parse_mode="Markdown",
                    )
                except Exception as e:
                    logger.error(f"Watch send error: {e}")

    task = asyncio.create_task(_watch_loop())
    _watch_tasks[chat_id] = task


async def stop_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = str(update.effective_chat.id)
    if not _is_admin(chat_id):
        await update.message.reply_text("Access denied.")
        return

    stopped = False
    if chat_id in _watchers:
        del _watchers[chat_id]
        stopped = True
    if chat_id in _watch_tasks:
        _watch_tasks[chat_id].cancel()
        del _watch_tasks[chat_id]
        stopped = True

    await update.message.reply_text(
        "Streaming stopped." if stopped else "Not currently streaming."
    )


# ── Entry point ────────────────────────────────────────────────────

def main() -> None:
    if not LOG_BOT_TOKEN:
        logger.error(
            "LOG_BOT_TOKEN is not set.\n"
            "1. Create a bot via @BotFather\n"
            "2. Add LOG_BOT_TOKEN=<token> to worker/.env"
        )
        return

    if not LOG_BOT_ADMIN_CHAT_ID:
        logger.warning(
            "LOG_BOT_ADMIN_CHAT_ID is not set — all commands will be denied.\n"
            "Send /start to the bot to get your chat ID, then add it to worker/.env."
        )

    app = Application.builder().token(LOG_BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("logs", logs_command))
    app.add_handler(CommandHandler("errors", errors_command))
    app.add_handler(CommandHandler("status", status_command))
    app.add_handler(CommandHandler("watch", watch_command))
    app.add_handler(CommandHandler("stop", stop_command))

    logger.info("Log bot starting...")
    app.run_polling(allowed_updates=["message"], drop_pending_updates=True)


if __name__ == "__main__":
    main()
