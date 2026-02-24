import contextlib
import functools
import http.server
import importlib.util
import socketserver
import threading
import unittest
from pathlib import Path


PLAYWRIGHT_AVAILABLE = importlib.util.find_spec("playwright") is not None
# QA/tests is nested one level under repository root.
ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(PLAYWRIGHT_AVAILABLE, "playwright is not installed")
class HomeSpacingGuardsPlaywrightTest(unittest.TestCase):
    """Numeric layout guardrails for homepage hero spacing and alignment."""

    @classmethod
    def setUpClass(cls):
        from playwright.sync_api import sync_playwright

        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
        try:
            cls.server = socketserver.TCPServer(("127.0.0.1", 0), handler)
        except PermissionError as exc:
            raise unittest.SkipTest(f"Local socket bind is blocked in this environment: {exc}")
        cls.port = cls.server.server_address[1]
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        with contextlib.suppress(Exception):
            cls.browser.close()
        with contextlib.suppress(Exception):
            cls.playwright.stop()
        with contextlib.suppress(Exception):
            cls.server.shutdown()
            cls.server.server_close()

    def _measure_layout(self, viewport):
        # Prefer reduced motion so spacing measurements are deterministic.
        context = self.browser.new_context(
            viewport=viewport,
            reduced_motion="reduce",
        )
        page = context.new_page()
        page.goto(f"http://127.0.0.1:{self.port}/", wait_until="networkidle")

        metrics = page.evaluate(
            """
            () => {
              const hero = document.querySelector('.hero.section');
              const firstSection = document.querySelector('.hero.section + .section');
              const blurb = document.querySelector('.hero-bio-text');
              const photo = document.querySelector('.hero-bio-photo img');
              if (!hero || !firstSection || !blurb || !photo) {
                return null;
              }
              const heroRect = hero.getBoundingClientRect();
              const firstSectionRect = firstSection.getBoundingClientRect();
              const blurbRect = blurb.getBoundingClientRect();
              const photoRect = photo.getBoundingClientRect();
              return {
                heroToSectionGap: firstSectionRect.top - heroRect.bottom,
                blurbPhotoTopDelta: Math.abs(photoRect.top - blurbRect.top),
              };
            }
            """
        )
        context.close()
        return metrics

    def test_desktop_gap_and_alignment_guard(self):
        metrics = self._measure_layout({"width": 1280, "height": 900})
        self.assertIsNotNone(metrics, "Unable to measure desktop homepage layout.")

        gap = metrics["heroToSectionGap"]
        self.assertGreaterEqual(
            gap,
            32,
            f"Desktop hero-to-first-section gap too small: {gap}px (expected >= 32px).",
        )
        self.assertLessEqual(
            gap,
            72,
            f"Desktop hero-to-first-section gap too large: {gap}px (expected <= 72px).",
        )

        top_delta = metrics["blurbPhotoTopDelta"]
        self.assertLessEqual(
            top_delta,
            2,
            f"Desktop photo top is not aligned to blurb top (delta={top_delta}px, expected <= 2px).",
        )

    def test_mobile_gap_guard(self):
        metrics = self._measure_layout({"width": 390, "height": 844})
        self.assertIsNotNone(metrics, "Unable to measure mobile homepage layout.")

        gap = metrics["heroToSectionGap"]
        self.assertGreaterEqual(
            gap,
            20,
            f"Mobile hero-to-first-section gap too small: {gap}px (expected >= 20px).",
        )
        self.assertLessEqual(
            gap,
            56,
            f"Mobile hero-to-first-section gap too large: {gap}px (expected <= 56px).",
        )


if __name__ == "__main__":
    unittest.main()
