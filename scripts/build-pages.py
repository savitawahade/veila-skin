"""Package the active Veila website for GitHub Pages without archived assets."""

from html.parser import HTMLParser
from pathlib import Path
import shutil
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "design"
OUTPUT = ROOT / "dist"


class LocalReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ("src", "href", "poster") or not value:
                continue
            url = urlsplit(value)
            if not url.scheme and not url.netloc and url.path:
                self.paths.add(unquote(url.path))


def build():
    html = (SOURCE / "veila-hero.html").read_bytes()
    references = LocalReferences()
    references.feed(html.decode("utf-8"))
    paths = references.paths | {
        str(path.relative_to(SOURCE))
        for path in (SOURCE / "assets/veila-products").glob("*-labelled.jpg")
    }
    for relative in paths:
        source = (SOURCE / relative).resolve()
        if not source.is_relative_to(SOURCE.resolve()) or not source.is_file():
            raise ValueError(f"Missing or invalid website asset: {relative}")
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    (OUTPUT / "index.html").write_bytes(html)
    (OUTPUT / ".nojekyll").touch()
    for relative in sorted(paths):
        destination = OUTPUT / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SOURCE / relative, destination)
    print(f"Prepared {len(paths) + 2} files in dist/; hero HTML unchanged.")


if __name__ == "__main__":
    build()
