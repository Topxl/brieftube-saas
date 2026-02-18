"""
Whisper API transcriber for YouTube videos
Uses Groq Whisper Large V3 Turbo to transcribe audio from YouTube videos
Fallback solution when YouTube transcripts are not available

Groq advantages:
- 9x cheaper than OpenAI ($0.00067/min vs $0.006/min)
- 228-383x faster than real-time
- Same Whisper Large V3 model quality
"""

import os
import logging
import tempfile
from pathlib import Path
from typing import Optional, Tuple
import yt_dlp
from groq import Groq

logger = logging.getLogger(__name__)


class WhisperTranscriber:
    """Transcribes YouTube videos using Groq Whisper Large V3 Turbo"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Whisper transcriber with Groq

        Args:
            api_key: Groq API key (if None, reads from GROQ_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("GROQ_API_KEY") or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY must be provided or set in environment")

        self.client = Groq(api_key=self.api_key)
        logger.info("Groq Whisper transcriber initialized")

    def _download_audio(self, youtube_url: str, output_path: Path) -> bool:
        """
        Download audio from YouTube video

        Args:
            youtube_url: YouTube video URL
            output_path: Path to save audio file

        Returns:
            True if successful, False otherwise
        """
        try:
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': str(output_path.with_suffix('')),  # yt-dlp adds .mp3
                'quiet': True,
                'no_warnings': True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([youtube_url])

            # Check if file was created
            mp3_path = output_path.with_suffix('.mp3')
            if mp3_path.exists():
                return True

            logger.error(f"Audio file not created: {mp3_path}")
            return False

        except Exception as e:
            logger.error(f"Error downloading audio: {e}")
            return False

    def transcribe(
        self,
        youtube_url: str,
        language: Optional[str] = None
    ) -> Tuple[Optional[str], Optional[str], Optional[str], float]:
        """
        Transcribe a YouTube video using Whisper API

        Args:
            youtube_url: YouTube video URL
            language: Optional language code (e.g., 'fr', 'en')
                     If None, Whisper will auto-detect

        Returns:
            Tuple of (transcript_text, detected_language, error_message, cost_usd)
            - transcript_text: Full transcript as string (None if failed)
            - detected_language: Language code detected by Whisper (None if failed)
            - error_message: Error description (None if successful)
            - cost_usd: Estimated cost in USD
        """
        temp_dir = None
        audio_file = None

        try:
            # Create temporary directory for audio file
            temp_dir = tempfile.mkdtemp(prefix="brieftube_whisper_")
            audio_path = Path(temp_dir) / "audio"

            # Step 1: Download audio from YouTube
            logger.info(f"Downloading audio from YouTube: {youtube_url}")
            success = self._download_audio(youtube_url, audio_path)

            if not success:
                return None, None, "audio_download_failed", 0.0

            audio_file = audio_path.with_suffix('.mp3')
            file_size_mb = audio_file.stat().st_size / (1024 * 1024)
            logger.info(f"Audio downloaded: {file_size_mb:.2f} MB")

            # Step 2: Transcribe with Groq Whisper API
            logger.info(f"Transcribing with Groq Whisper Large V3 Turbo (language: {language or 'auto-detect'})...")

            with open(audio_file, 'rb') as f:
                # Use whisper-large-v3-turbo for best speed/price
                # Groq: $0.00067/min (9x cheaper than OpenAI!)
                transcript_response = self.client.audio.transcriptions.create(
                    model="whisper-large-v3-turbo",  # $0.04/hour = $0.00067/min
                    file=f,
                    language=language,
                    response_format="verbose_json"
                )

            transcript = transcript_response.text
            detected_lang = transcript_response.language if hasattr(transcript_response, 'language') else language

            # Calculate cost
            # Groq Whisper Large V3 Turbo: $0.04/hour = $0.00067/min
            duration_minutes = transcript_response.duration / 60 if hasattr(transcript_response, 'duration') else file_size_mb * 3
            cost_per_minute = 0.00067  # Groq pricing
            estimated_cost = duration_minutes * cost_per_minute

            logger.info(
                f"✅ Transcription complete: {len(transcript)} chars, "
                f"language: {detected_lang}, "
                f"duration: ~{duration_minutes:.1f} min, "
                f"cost: ~${estimated_cost:.4f}"
            )

            return transcript, detected_lang, None, estimated_cost

        except Exception as e:
            logger.error(f"Whisper transcription error: {e}")
            return None, None, f"whisper_error: {str(e)}", 0.0

        finally:
            # Cleanup temporary files
            if audio_file and audio_file.exists():
                try:
                    audio_file.unlink()
                except Exception:
                    pass

            if temp_dir:
                try:
                    Path(temp_dir).rmdir()
                except Exception:
                    pass


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("❌ Set GROQ_API_KEY environment variable")
        exit(1)

    # Test with a YouTube video
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

    transcriber = WhisperTranscriber(api_key=api_key)
    transcript, lang, error, cost = transcriber.transcribe(test_url)

    if transcript:
        print(f"✅ Transcript: {len(transcript)} chars")
        print(f"Language: {lang}")
        print(f"Cost: ${cost:.4f}")
        print(f"Preview: {transcript[:200]}...")
    else:
        print(f"❌ Failed: {error}")
