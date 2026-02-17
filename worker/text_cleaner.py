"""
Text cleaner for TTS
Removes Markdown formatting and special characters before text-to-speech conversion
"""

import re


def clean_for_tts(text: str) -> str:
    """
    Clean text for TTS by removing Markdown formatting and special characters

    Args:
        text: Raw text with Markdown formatting

    Returns:
        Clean text ready for TTS
    """
    # Remove Markdown headers (## Title, ### Title, etc.)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)

    # Remove bold and italic markers (**, *, _)
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\1', text)  # ***bold italic***
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)      # **bold**
    text = re.sub(r'\*(.+?)\*', r'\1', text)          # *italic*
    text = re.sub(r'__(.+?)__', r'\1', text)          # __bold__
    text = re.sub(r'_(.+?)_', r'\1', text)            # _italic_

    # Remove links [text](url) -> keep only text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)

    # Remove inline code `code`
    text = re.sub(r'`([^`]+)`', r'\1', text)

    # Remove code blocks ```code``` (multiline)
    text = re.sub(r'```[\s\S]*?```', '', text, flags=re.DOTALL)
    # Remove remaining backticks
    text = text.replace('```', '')
    text = text.replace('``', '')

    # Remove horizontal rules (---, ***, ___)
    text = re.sub(r'^[\-\*_]{3,}\s*$', '', text, flags=re.MULTILINE)

    # Remove blockquotes (> text)
    text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)

    # Remove list markers (- item, * item, + item, 1. item)
    text = re.sub(r'^[\-\*\+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Remove excessive punctuation
    text = re.sub(r'\.{2,}', '.', text)  # ... -> .
    text = re.sub(r'!{2,}', '!', text)   # !!! -> !
    text = re.sub(r'\?{2,}', '?', text)  # ??? -> ?

    # Remove multiple spaces
    text = re.sub(r' {2,}', ' ', text)

    # Remove multiple newlines (keep max 2 for paragraphs)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Clean up whitespace
    text = text.strip()

    return text


# Test examples
if __name__ == "__main__":
    test_text = """
# Grand Titre

Voici un **texte en gras** et *en italique*.

## Sous-titre

- Premier point
- Deuxième point

> Citation importante

Du texte avec `du code` et des liens [cliquez ici](https://example.com).

---

### Section finale

Du texte normal avec des symboles... et des *** astérisques *** partout!!!

```python
# Code à supprimer
print("hello")
```

Texte final.
    """

    print("AVANT:")
    print(test_text)
    print("\n" + "="*70 + "\n")
    print("APRÈS:")
    print(clean_for_tts(test_text))
