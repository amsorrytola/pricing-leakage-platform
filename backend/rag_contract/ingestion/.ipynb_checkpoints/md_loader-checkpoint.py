import re

def clean_markdown(text: str) -> str:
    # Remove fenced code blocks
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)

    # Remove inline code
    text = re.sub(r"`[^`]*`", "", text)

    # Remove markdown symbols
    text = re.sub(r"[#>*_\-]", " ", text)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def load_md(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    return clean_markdown(text)
