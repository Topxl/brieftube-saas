"""
BriefTube Worker Monitoring System

Tracks worker statistics and sends alerts to admin via Telegram.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import psutil

logger = logging.getLogger(__name__)

# ── Statistics Storage ────────────────────────────────────────────

class WorkerStats:
    """Singleton class to track worker statistics."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._initialized = True
        self.start_time = datetime.now()

        # Counters
        self.videos_processed = 0
        self.videos_failed = 0
        self.rss_scans = 0
        self.new_videos_found = 0
        self.deliveries_sent = 0
        self.deliveries_failed = 0

        # Error tracking
        self.errors_by_type = {}
        self.last_errors = []  # List of (timestamp, error_message)
        self.max_errors_stored = 20

        # Performance
        self.last_video_time = None
        self.avg_processing_time = 0
        self.processing_times = []

    def record_video_processed(self, processing_time: float):
        """Record a successfully processed video."""
        self.videos_processed += 1
        self.last_video_time = datetime.now()
        self.processing_times.append(processing_time)
        if len(self.processing_times) > 100:
            self.processing_times.pop(0)
        self.avg_processing_time = sum(self.processing_times) / len(self.processing_times)

    def record_video_failed(self, error_type: str, error_message: str):
        """Record a failed video processing."""
        self.videos_failed += 1
        self.errors_by_type[error_type] = self.errors_by_type.get(error_type, 0) + 1
        self.last_errors.append((datetime.now(), error_message))
        if len(self.last_errors) > self.max_errors_stored:
            self.last_errors.pop(0)

    def record_rss_scan(self, new_videos: int):
        """Record an RSS scan."""
        self.rss_scans += 1
        self.new_videos_found += new_videos

    def record_delivery_sent(self):
        """Record a successful delivery."""
        self.deliveries_sent += 1

    def record_delivery_failed(self):
        """Record a failed delivery."""
        self.deliveries_failed += 1

    def get_uptime(self) -> str:
        """Get formatted uptime."""
        delta = datetime.now() - self.start_time
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m {seconds}s"

    def get_summary(self) -> dict:
        """Get all statistics as a dictionary."""
        return {
            "uptime": self.get_uptime(),
            "start_time": self.start_time.isoformat(),
            "videos_processed": self.videos_processed,
            "videos_failed": self.videos_failed,
            "rss_scans": self.rss_scans,
            "new_videos_found": self.new_videos_found,
            "deliveries_sent": self.deliveries_sent,
            "deliveries_failed": self.deliveries_failed,
            "avg_processing_time": round(self.avg_processing_time, 2),
            "last_video_time": self.last_video_time.isoformat() if self.last_video_time else None,
            "errors_by_type": self.errors_by_type,
            "recent_errors": [
                {"time": t.isoformat(), "message": msg}
                for t, msg in self.last_errors[-5:]
            ]
        }


# Global instance
stats = WorkerStats()


# ── Alert System ──────────────────────────────────────────────────

class MonitoringAlert:
    """Sends alerts to admin Telegram chat."""

    def __init__(self, bot_app, admin_chat_id: Optional[str] = None):
        self.bot_app = bot_app
        self.admin_chat_id = admin_chat_id
        self.alert_queue = asyncio.Queue()
        self.is_running = False

    async def send_alert(self, message: str, level: str = "INFO"):
        """Queue an alert to be sent to admin."""
        if not self.admin_chat_id:
            return

        # Add emoji based on level
        emoji = {
            "INFO": "ℹ️",
            "SUCCESS": "✅",
            "WARNING": "⚠️",
            "ERROR": "🔴",
            "CRITICAL": "🚨"
        }.get(level, "📢")

        formatted = f"{emoji} **{level}**\n\n{message}"
        await self.alert_queue.put(formatted)

    async def process_alerts(self):
        """Background task to send queued alerts."""
        self.is_running = True
        logger.info("Monitoring alerts started")

        while self.is_running:
            try:
                # Get alert from queue (with timeout)
                try:
                    message = await asyncio.wait_for(self.alert_queue.get(), timeout=5.0)
                except asyncio.TimeoutError:
                    continue

                # Send to admin
                try:
                    await self.bot_app.bot.send_message(
                        chat_id=self.admin_chat_id,
                        text=message,
                        parse_mode="Markdown"
                    )
                except Exception as e:
                    logger.error(f"Failed to send alert: {e}")

                # Rate limit
                await asyncio.sleep(1)

            except Exception as e:
                logger.error(f"Alert processing error: {e}")
                await asyncio.sleep(5)

    async def stop(self):
        """Stop the alert processor."""
        self.is_running = False


# ── System Information ────────────────────────────────────────────

def get_system_info() -> dict:
    """Get system resource usage."""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return {
            "cpu_percent": round(cpu_percent, 1),
            "memory_percent": round(memory.percent, 1),
            "memory_used_mb": round(memory.used / 1024 / 1024, 1),
            "disk_percent": round(disk.percent, 1),
            "disk_free_gb": round(disk.free / 1024 / 1024 / 1024, 1),
        }
    except Exception as e:
        logger.error(f"Failed to get system info: {e}")
        return {}


def get_log_tail(lines: int = 50) -> str:
    """Get last N lines from worker.log."""
    log_file = Path(__file__).parent / "worker.log"

    try:
        with open(log_file, "r", encoding="utf-8") as f:
            all_lines = f.readlines()
            tail_lines = all_lines[-lines:]
            return "".join(tail_lines)
    except Exception as e:
        return f"Error reading logs: {e}"


# ── Daily Report ──────────────────────────────────────────────────

async def send_daily_report(alert_system: MonitoringAlert):
    """Send daily statistics report to admin."""
    summary = stats.get_summary()
    system = get_system_info()

    report = f"""📊 **Daily Worker Report**

**Uptime:** {summary['uptime']}

**Videos:**
• Processed: {summary['videos_processed']}
• Failed: {summary['videos_failed']}
• Avg time: {summary['avg_processing_time']}s

**RSS Scans:** {summary['rss_scans']}
**New videos found:** {summary['new_videos_found']}

**Deliveries:**
• Sent: {summary['deliveries_sent']}
• Failed: {summary['deliveries_failed']}

**System:**
• CPU: {system.get('cpu_percent', 'N/A')}%
• Memory: {system.get('memory_percent', 'N/A')}%
• Disk: {system.get('disk_free_gb', 'N/A')} GB free

**Recent Errors:** {len(summary['recent_errors'])}
"""

    await alert_system.send_alert(report, level="INFO")
