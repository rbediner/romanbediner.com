"""Render the canonical Fleet Build Guide into the website's locked preview pages.

The PDF is the source of truth. This script keeps the carousel pages and their
manifest coupled to it so a visitor never previews a different document from
the one they download.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
PDF = ROOT / "assets" / "downloads" / "agentic-fleet-build-guide-roman-bediner.pdf"
SLIDES = ROOT / "assets" / "resources" / "agentic-fleet-build-guide" / "slides"
MANIFEST = ROOT / "assets" / "resources" / "agentic-fleet-build-guide" / "preview-manifest.json"


def sha256(path: Path) -> str:
    """Return the checksum used by the website integration contract."""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    """Render every page at the documented 150-DPI preview resolution."""
    if not PDF.exists():
        raise FileNotFoundError(f"Canonical guide PDF is missing: {PDF}")

    SLIDES.mkdir(parents=True, exist_ok=True)
    renderer = shutil.which("pdftoppm")
    if not renderer:
        raise RuntimeError("Poppler pdftoppm is required to render the guide preview")

    # Poppler appends a two-digit page number to this prefix, producing the
    # stable slide-01.png through slide-24.png paths used by the carousel.
    subprocess.run(
        [renderer, "-r", "150", "-png", str(PDF), str(SLIDES / "slide")],
        check=True,
    )
    slide_paths = sorted(SLIDES.glob("slide-*.png"))
    if len(slide_paths) != 24:
        raise RuntimeError(f"Expected 24 rendered preview pages, found {len(slide_paths)}")

    pages: dict[str, str] = {}
    for output in slide_paths:
        pages[output.name] = sha256(output)

    MANIFEST.write_text(
        json.dumps(
            {
                "artifact": "/assets/downloads/agentic-fleet-build-guide-roman-bediner.pdf",
                "artifactSha256": sha256(PDF),
                "rendering": "Poppler pdftoppm(r=150)",
                "pages": pages,
            },
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    print(f"Rendered {len(slide_paths)} preview pages from {PDF}")


if __name__ == "__main__":
    main()
