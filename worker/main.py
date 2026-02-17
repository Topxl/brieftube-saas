#!/usr/bin/env python3
"""
BriefTube SaaS Worker

Three concurrent loops:
1. RSS Scanner   — checks channels for new videos (every 5 min)
2. Gemini Processor — summarizes + generates TTS audio
3. Telegram Deliverer — sends audio to subscribed users
"""

import asyncio
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from config import RSS_CHECK_INTERVAL, TELEGRAM_BOT_TOKEN, SUPABASE_URL
from transcript_extractor import TranscriptExtractor
from gemini_api import GeminiSummarizer
from text_cleaner import clean_for_tts
from tts_processor import text_to_audio, cleanup_audio_files
from telegram_deliverer import send_audio_to_user
from bot_handler import create_bot_application
import rss_scanner
import db

# ── Logging ────────────────────────────────────────────────────

LOG_FILE = Path(__file__).parent / "worker.log"
log_fmt = logging.Formatter("%(asctime)s [%(name)s] %(levelname)s %(message)s")

root = logging.getLogger()
root.setLevel(logging.INFO)

fh = RotatingFileHandler(LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=2, encoding="utf-8")
fh.setFormatter(log_fmt)
root.addHandler(fh)

ch = logging.StreamHandler()
ch.setFormatter(log_fmt)
root.addHandler(ch)

logger = logging.getLogger("worker")

logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

# ── Constants ──────────────────────────────────────────────────

VIDEO_TIMEOUT = 600  # 10 minutes max per video


# ── Loop 1: RSS Scanner ───────────────────────────────────────

async def rss_loop():
    """Periodically scan all subscribed channels for new videos."""
    logger.info(f"RSS Scanner started (interval: {RSS_CHECK_INTERVAL}s)")

    while True:
        try:
            new = await asyncio.to_thread(rss_scanner.scan_all_channels)
            if new:
                logger.info(f"RSS: {new} new videos queued")
        except Exception as e:
            logger.error(f"RSS loop error: {e}")

        await asyncio.sleep(RSS_CHECK_INTERVAL)


# ── Loop 2: Gemini Processor ──────────────────────────────────

async def processor_loop():
    """Pick jobs from processing_queue, transcribe, summarize, generate TTS."""
    logger.info("Gemini Processor started")

    # Initialize transcript extractor (with Groq fallback)
    transcript_extractor = TranscriptExtractor(enable_whisper_fallback=True)
    logger.info("Transcript extractor ready (YouTube + Groq fallback)")

    # Initialize Gemini API summarizer
    try:
        gemini_summarizer = GeminiSummarizer()
        logger.info("Gemini 3 API summarizer ready")
    except ValueError as e:
        logger.error(f"Failed to initialize Gemini API: {e}")
        return

    while True:
        try:
            job = db.pick_next_job()
            if not job:
                await asyncio.sleep(10)
                continue

            video_id = job["video_id"]
            youtube_url = job["youtube_url"]
            video_title = job.get("video_title", video_id)
            logger.info(f"Processing: {video_title}")

            try:
                # Get user preferences (language, voice)
                user_language = job.get("user_language", "fr")
                tts_voice = job.get("tts_voice") or None

                # Step 1: Extract transcript (YouTube transcripts + Groq fallback)
                logger.info(f"[{video_id}] Extracting transcript...")
                transcript, source_lang, error, transcript_cost = await asyncio.to_thread(
                    transcript_extractor.get_transcript,
                    youtube_url,
                    preferred_languages=[user_language, 'fr', 'en']
                )

                if not transcript:
                    logger.error(f"[{video_id}] Transcript extraction failed: {error}")

                    # Check if should retry later
                    if TranscriptExtractor.should_retry(error):
                        logger.info(f"[{video_id}] Will retry later")
                        db.requeue_job(job["id"])  # Requeue for retry
                    else:
                        raise Exception(f"Transcript extraction failed: {error}")
                    continue

                logger.info(
                    f"[{video_id}] Transcript extracted: {len(transcript)} chars, "
                    f"lang: {source_lang}, cost: ${transcript_cost:.4f}"
                )

                # Step 2: Summarize with Gemini 3 API (and translate if needed)
                logger.info(f"[{video_id}] Generating summary with Gemini 3...")
                summary, summary_error = await asyncio.to_thread(
                    gemini_summarizer.summarize,
                    transcript=transcript,
                    source_language=source_lang,
                    target_language=user_language,
                    video_url=youtube_url
                )

                if not summary:
                    raise Exception(f"Summary generation failed: {summary_error}")

                logger.info(f"[{video_id}] Summary generated: {len(summary)} chars")

                # Step 3: Clean summary for TTS (remove Markdown)
                clean_summary = clean_for_tts(summary)
                logger.info(f"[{video_id}] Text cleaned: {len(summary)} → {len(clean_summary)} chars")

                # Step 4: Generate TTS audio
                logger.info(f"[{video_id}] Generating audio...")
                audio_path = await text_to_audio(
                    clean_summary,
                    voice=tts_voice,
                    output_filename=f"video_{video_id}"
                )

                # Upload audio to Supabase Storage
                audio_url = ""
                try:
                    sb = db.get_client()
                    with open(audio_path, "rb") as f:
                        storage_path = f"audio/{video_id}.mp3"
                        sb.storage.from_("audio").upload(
                            storage_path,
                            f.read(),
                            {"content-type": "audio/mpeg"},
                        )
                    audio_url = sb.storage.from_("audio").get_public_url(storage_path)
                except Exception as e:
                    logger.warning(f"Storage upload failed (using local): {e}")
                    audio_url = str(audio_path)

                # Mark video as completed (save transcript cost for analytics)
                db.mark_video_completed(
                    video_id,
                    summary,
                    audio_url,
                    metadata={
                        "transcript_cost": transcript_cost,
                        "transcript_length": len(transcript),
                        "source_language": source_lang,
                        "summary_length": len(summary)
                    }
                )
                db.complete_job(job["id"])

                logger.info(
                    f"✅ Completed: {video_title} "
                    f"(transcript: ${transcript_cost:.4f}, "
                    f"source: {source_lang}, summary: {len(summary)} chars)"
                )

                # Small delay between videos
                await asyncio.sleep(5)

            except asyncio.TimeoutError:
                logger.error(f"Timeout processing: {video_title}")
                db.fail_job(job["id"])
                db.mark_video_failed(video_id)

            except Exception as e:
                logger.error(f"Error processing {video_title}: {e}")
                db.fail_job(job["id"])
                db.mark_video_failed(video_id)
                await asyncio.sleep(5)

        except Exception as e:
            logger.error(f"Processor loop error: {e}")
            await asyncio.sleep(10)


# ── Loop 3: Telegram Deliverer ─────────────────────────────────

async def delivery_loop():
    """Send completed audio to subscribed users."""
    logger.info("Telegram Deliverer started")

    while True:
        try:
            deliveries = db.get_pending_deliveries(limit=10)

            for d in deliveries:
                try:
                    video_id = d["video_id"]
                    audio_url = d.get("audio_url", "")

                    # Get or download audio file
                    audio_path = Path(__file__).parent / "audio" / f"video_{video_id}.mp3"

                    if not audio_path.exists() and audio_url and audio_url.startswith("http"):
                        # Download from Supabase Storage
                        import aiohttp
                        async with aiohttp.ClientSession() as session:
                            async with session.get(audio_url) as resp:
                                if resp.status == 200:
                                    audio_path.parent.mkdir(exist_ok=True)
                                    with open(audio_path, "wb") as f:
                                        f.write(await resp.read())

                    if not audio_path.exists():
                        # Regenerate audio from summary
                        if d.get("summary"):
                            voice = d.get("tts_voice") or None
                            audio_path = await text_to_audio(
                                d["summary"], voice=voice, output_filename=f"video_{video_id}"
                            )
                        else:
                            logger.warning(f"No audio for {video_id}")
                            db.mark_delivery_failed(d["delivery_id"])
                            continue

                    # Send to user
                    success = await send_audio_to_user(
                        chat_id=d["chat_id"],
                        audio_path=audio_path,
                        video_title=d["video_title"],
                        video_id=video_id,
                        channel_id=d["channel_id"],
                    )

                    if success:
                        db.mark_delivery_sent(d["delivery_id"])
                    else:
                        db.mark_delivery_failed(d["delivery_id"])

                    # Rate limit: 1 message per second
                    await asyncio.sleep(1)

                except Exception as e:
                    logger.error(f"Delivery error: {e}")
                    db.mark_delivery_failed(d["delivery_id"])

            if not deliveries:
                await asyncio.sleep(15)

            # Cleanup old audio files every cycle
            cleanup_audio_files(max_age_hours=1)

        except Exception as e:
            logger.error(f"Delivery loop error: {e}")
            await asyncio.sleep(15)


# ── Main ───────────────────────────────────────────────────────

async def main():
    logger.info("=" * 50)
    logger.info("BriefTube SaaS Worker starting...")
    logger.info("=" * 50)

    # Validate config
    if not SUPABASE_URL:
        logger.error("SUPABASE_URL not set")
        return
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set")
        return

    logger.info(f"Supabase: {SUPABASE_URL[:30]}...")
    logger.info(f"RSS interval: {RSS_CHECK_INTERVAL}s")

    # Start Telegram bot (polling in background)
    bot_app = create_bot_application()
    await bot_app.initialize()
    await bot_app.start()
    await bot_app.updater.start_polling(allowed_updates=["message"])
    logger.info("Telegram bot polling started")

    try:
        # Run all 3 loops concurrently
        await asyncio.gather(
            rss_loop(),
            processor_loop(),
            delivery_loop(),
        )
    finally:
        await bot_app.updater.stop()
        await bot_app.stop()
        await bot_app.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
