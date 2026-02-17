"""Supabase database client for the worker."""

import logging
from datetime import datetime, timezone
from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

logger = logging.getLogger(__name__)

_client: Client = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


# ── Subscriptions ──────────────────────────────────────────────

def get_all_channel_ids() -> list[str]:
    """Get all distinct channel IDs that at least one user is subscribed to."""
    sb = get_client()
    res = sb.table("subscriptions").select("channel_id").eq("active", True).execute()
    return list({row["channel_id"] for row in res.data})


# ── Processed Videos ───────────────────────────────────────────

def is_video_processed(video_id: str) -> bool:
    sb = get_client()
    res = sb.table("processed_videos").select("id").eq("video_id", video_id).execute()
    return len(res.data) > 0


def mark_video_completed(video_id: str, summary: str, audio_url: str, metadata: dict = None):
    sb = get_client()
    update_data = {
        "summary": summary,
        "audio_url": audio_url,
        "status": "completed",
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }
    if metadata:
        update_data["metadata"] = metadata
    sb.table("processed_videos").update(update_data).eq("video_id", video_id).execute()


def mark_video_failed(video_id: str):
    sb = get_client()
    # Increment failure_count
    row = sb.table("processed_videos").select("failure_count").eq("video_id", video_id).single().execute()
    count = (row.data.get("failure_count") or 0) + 1
    status = "failed" if count >= 3 else "pending"
    sb.table("processed_videos").update({
        "failure_count": count,
        "status": status,
    }).eq("video_id", video_id).execute()


def insert_new_video(video_id: str, channel_id: str, video_title: str, video_url: str):
    """Insert a new video into processed_videos (status=pending)."""
    sb = get_client()
    sb.table("processed_videos").upsert({
        "video_id": video_id,
        "channel_id": channel_id,
        "video_title": video_title,
        "video_url": video_url,
        "status": "pending",
    }, on_conflict="video_id").execute()


# ── Processing Queue ───────────────────────────────────────────

def enqueue_video(video_id: str, youtube_url: str, video_title: str, channel_id: str):
    sb = get_client()
    sb.table("processing_queue").upsert({
        "video_id": video_id,
        "youtube_url": youtube_url,
        "video_title": video_title,
        "channel_id": channel_id,
        "status": "queued",
    }, on_conflict="video_id").execute()


def pick_next_job() -> dict | None:
    """Pick the next queued job (oldest first). Returns dict or None."""
    sb = get_client()
    res = (
        sb.table("processing_queue")
        .select("*")
        .eq("status", "queued")
        .order("created_at")
        .limit(1)
        .execute()
    )
    if not res.data:
        return None
    job = res.data[0]
    # Mark as processing
    sb.table("processing_queue").update({
        "status": "processing",
    }).eq("id", job["id"]).execute()
    return job


def complete_job(job_id: str):
    sb = get_client()
    sb.table("processing_queue").update({"status": "completed"}).eq("id", job_id).execute()


def fail_job(job_id: str):
    sb = get_client()
    job = sb.table("processing_queue").select("attempts").eq("id", job_id).single().execute()
    attempts = (job.data.get("attempts") or 0) + 1
    status = "failed" if attempts >= 3 else "queued"
    sb.table("processing_queue").update({
        "status": status,
        "attempts": attempts,
    }).eq("id", job_id).execute()


# ── Deliveries ─────────────────────────────────────────────────

def create_deliveries_for_video(video_id: str, channel_id: str):
    """Create delivery entries for all users subscribed to this channel."""
    sb = get_client()
    # Get all users subscribed to this channel
    subs = (
        sb.table("subscriptions")
        .select("user_id")
        .eq("channel_id", channel_id)
        .eq("active", True)
        .execute()
    )
    for sub in subs.data:
        sb.table("deliveries").upsert({
            "user_id": sub["user_id"],
            "video_id": video_id,
            "status": "pending",
        }, on_conflict="user_id,video_id").execute()


def get_pending_deliveries(limit: int = 20) -> list[dict]:
    """Get pending deliveries where the video is completed."""
    sb = get_client()
    # Get pending deliveries
    deliveries = (
        sb.table("deliveries")
        .select("id, user_id, video_id")
        .eq("status", "pending")
        .order("created_at")
        .limit(limit)
        .execute()
    )
    results = []
    for d in deliveries.data:
        # Check if video is completed
        video = (
            sb.table("processed_videos")
            .select("video_id, video_title, channel_id, summary, audio_url")
            .eq("video_id", d["video_id"])
            .eq("status", "completed")
            .execute()
        )
        if not video.data:
            continue
        v = video.data[0]
        # Get user's telegram chat_id and tts_voice
        profile = (
            sb.table("profiles")
            .select("telegram_chat_id, tts_voice, telegram_connected")
            .eq("id", d["user_id"])
            .single()
            .execute()
        )
        if not profile.data or not profile.data.get("telegram_connected"):
            continue
        results.append({
            "delivery_id": d["id"],
            "chat_id": profile.data["telegram_chat_id"],
            "tts_voice": profile.data.get("tts_voice"),
            "video_id": v["video_id"],
            "video_title": v["video_title"],
            "channel_id": v["channel_id"],
            "summary": v["summary"],
            "audio_url": v["audio_url"],
        })
    return results


def mark_delivery_sent(delivery_id: str):
    sb = get_client()
    sb.table("deliveries").update({
        "status": "sent",
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", delivery_id).execute()


def mark_delivery_failed(delivery_id: str):
    sb = get_client()
    sb.table("deliveries").update({"status": "failed"}).eq("id", delivery_id).execute()


def count_on_demand_this_month(user_id: str) -> int:
    """Count on-demand deliveries for a user in the current calendar month."""
    sb = get_client()
    month_start = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    ).isoformat()
    res = (
        sb.table("deliveries")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("source", "on_demand")
        .gte("created_at", month_start)
        .execute()
    )
    return res.count or 0


def mark_existing_videos_as_skipped(channel_id: str):
    """Mark all existing RSS videos for a channel as skipped."""
    import feedparser

    sb = get_client()
    rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    feed = feedparser.parse(rss_url)

    for entry in feed.entries:
        video_id = getattr(entry, "yt_videoid", None)
        if not video_id:
            continue
        sb.table("processed_videos").upsert(
            {
                "video_id": video_id,
                "channel_id": channel_id,
                "video_title": entry.get("title", "[initial]"),
                "video_url": entry.get("link", f"https://www.youtube.com/watch?v={video_id}"),
                "status": "skipped",
            },
            on_conflict="video_id",
            ignore_duplicates=True,
        ).execute()
