"""
Gemini API integration for video summarization with multilingual support
Uses google-genai (modern package) with Gemini 3
"""

import logging
import os
from typing import Optional, Tuple
from google import genai
from google.genai.types import GenerateContentConfig

logger = logging.getLogger(__name__)


class GeminiSummarizer:
    """
    Summarizes video transcripts using Gemini 3 API
    Supports automatic translation to user's preferred language
    """

    # Available models (ordered by preference)
    MODELS = [
        "gemini-3-flash-preview",  # Latest, fastest
        "gemini-3-pro-preview",    # Latest, most capable
        "gemini-2.5-flash",        # Fallback
        "gemini-2.5-pro",          # Fallback pro
    ]

    # Language names for prompts
    LANGUAGE_NAMES = {
        'fr': 'français',
        'en': 'English',
        'es': 'español',
        'de': 'Deutsch',
        'it': 'italiano',
        'pt': 'português',
        'nl': 'Nederlands',
        'pl': 'polski',
        'ru': 'русский',
        'ja': '日本語',
        'ko': '한국어',
        'zh': '中文',
        'ar': 'العربية',
        'hi': 'हिन्दी',
        'tr': 'Türkçe',
    }

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini API client

        Args:
            api_key: Google AI API key (if None, reads from GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY must be provided or set in environment")

        self.client = genai.Client(api_key=self.api_key)
        logger.info("Gemini API client initialized")

    def _get_language_name(self, lang_code: str) -> str:
        """Get full language name from code"""
        return self.LANGUAGE_NAMES.get(lang_code.lower(), lang_code)

    def summarize(
        self,
        transcript: str,
        source_language: Optional[str] = None,
        target_language: str = 'fr',
        video_url: Optional[str] = None,
        model: Optional[str] = None
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Summarize a video transcript and translate to target language

        Args:
            transcript: Full video transcript text
            source_language: Language code of the transcript (e.g., 'en', 'fr')
            target_language: Desired language for the summary (default: 'fr')
            video_url: Optional YouTube URL for context
            model: Optional specific model to use (default: tries models in order)

        Returns:
            Tuple of (summary_text, error_message)
            - summary_text: Summarized and translated text (None if failed)
            - error_message: Error description (None if successful)
        """
        if not transcript or len(transcript.strip()) < 50:
            return None, "transcript_too_short"

        # Build the prompt
        target_lang_name = self._get_language_name(target_language)

        # Determine target summary length based on transcript length
        transcript_words = len(transcript.split())

        # Rule: Summary should be 30-60% of original for long content,
        # or 50-80% for short content (minimum 100 words for very short videos)
        if transcript_words < 200:
            min_words = max(100, int(transcript_words * 0.5))
            max_words = int(transcript_words * 1.5)
            length_guidance = f"environ {min_words}-{max_words} mots (vidéo courte)"
        elif transcript_words < 500:
            min_words = int(transcript_words * 0.4)
            max_words = int(transcript_words * 0.8)
            length_guidance = f"environ {min_words}-{max_words} mots"
        else:
            min_words = int(transcript_words * 0.3)
            max_words = int(transcript_words * 0.6)
            length_guidance = f"environ {min_words}-{max_words} mots"

        # Create context-aware prompt
        prompt_parts = []

        if video_url:
            prompt_parts.append(f"Vidéo YouTube: {video_url}\n")

        if source_language and source_language != target_language:
            source_lang_name = self._get_language_name(source_language)
            prompt_parts.append(
                f"La transcription ci-dessous est en {source_lang_name}. "
                f"Tu dois créer un résumé concis en {target_lang_name}.\n\n"
            )
        else:
            prompt_parts.append(
                f"Tu dois créer un résumé concis en {target_lang_name} de la transcription ci-dessous.\n\n"
            )

        prompt_parts.append(
            "Instructions:\n"
            f"1. Fais un résumé concis de {length_guidance}\n"
            "2. Va à l'essentiel : capture les points clés et idées principales\n"
            "3. Garde les informations importantes mais évite les répétitions\n"
            "4. Utilise un ton naturel et engageant\n"
            f"5. Le résumé DOIT être en {target_lang_name}\n"
            "6. IMPORTANT: Le résumé doit être PLUS COURT que la transcription originale\n\n"
            "Transcription:\n"
            f"{transcript}\n\n"
            f"Résumé concis en {target_lang_name} ({length_guidance}):"
        )

        prompt = "".join(prompt_parts)

        # Try models in order
        models_to_try = [model] if model else self.MODELS

        for model_name in models_to_try:
            try:
                logger.info(f"Attempting summarization with model: {model_name}")

                response = self.client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=GenerateContentConfig(
                        temperature=0.7,
                        max_output_tokens=4096,
                    )
                )

                summary = response.text.strip()

                if len(summary) < 100:
                    logger.warning(f"Summary too short ({len(summary)} chars), trying next model")
                    continue

                logger.info(
                    f"✅ Successfully generated summary with {model_name}: "
                    f"{len(summary)} chars"
                )

                return summary, None

            except Exception as e:
                logger.error(f"Failed with model {model_name}: {e}")
                # Try next model
                continue

        # All models failed
        return None, "all_models_failed"

    def summarize_with_retry(
        self,
        transcript: str,
        source_language: Optional[str] = None,
        target_language: str = 'fr',
        video_url: Optional[str] = None,
        max_retries: int = 2
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Summarize with automatic retry on failure

        Args:
            transcript: Full video transcript text
            source_language: Language code of the transcript
            target_language: Desired language for the summary
            video_url: Optional YouTube URL for context
            max_retries: Maximum number of retry attempts

        Returns:
            Tuple of (summary_text, error_message)
        """
        for attempt in range(max_retries + 1):
            if attempt > 0:
                logger.info(f"Retry attempt {attempt}/{max_retries}")

            summary, error = self.summarize(
                transcript=transcript,
                source_language=source_language,
                target_language=target_language,
                video_url=video_url
            )

            if summary:
                return summary, None

            # If this was the last attempt, return the error
            if attempt == max_retries:
                return None, error

        return None, "max_retries_exceeded"


# Example usage and testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Set GEMINI_API_KEY environment variable")
        exit(1)

    # Test with a sample English transcript
    test_transcript = """
    Hello everyone, welcome to this tutorial about Python programming.
    Today we're going to learn about functions and how to use them effectively.
    Functions are reusable blocks of code that perform specific tasks.
    They help us organize our code and make it more maintainable.
    Let's start with a simple example of a function that adds two numbers.
    """

    summarizer = GeminiSummarizer(api_key=api_key)

    print("Testing English → French translation and summary...")
    summary, error = summarizer.summarize(
        transcript=test_transcript,
        source_language='en',
        target_language='fr',
        video_url="https://www.youtube.com/watch?v=example"
    )

    if summary:
        print(f"✅ Summary generated ({len(summary)} chars)")
        print(f"\n{summary}")
    else:
        print(f"❌ Failed: {error}")
