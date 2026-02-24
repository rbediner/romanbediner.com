import contextlib
import functools
import http.server
import importlib.util
import socketserver
import threading
import unittest
from pathlib import Path


PLAYWRIGHT_AVAILABLE = importlib.util.find_spec("playwright") is not None
ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(PLAYWRIGHT_AVAILABLE, "playwright is not installed")
class HomeLayoutSpacingPlaywrightTest(unittest.TestCase):
    """Hard numeric guardrails for Home hero spacing and geometry."""

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

    def _capture_metrics(self, width, height):
        context = self.browser.new_context(
            viewport={"width": width, "height": height},
            reduced_motion="reduce",
        )
        page = context.new_page()
        page.goto(f"http://127.0.0.1:{self.port}/", wait_until="networkidle")

        metrics = page.evaluate(
            """
            () => {
              const hero = document.querySelector('.home-hero.section');
              const experience = document.querySelector('#experience');
              const photo = document.querySelector('.hero-photo img');
              const blurb = document.querySelector('.hero-blurb p');
              if (!hero || !experience || !photo || !blurb) {
                return null;
              }
              const heroRect = hero.getBoundingClientRect();
              const expRect = experience.getBoundingClientRect();
              const photoRect = photo.getBoundingClientRect();
              const blurbRect = blurb.getBoundingClientRect();
              return {
                gap: expRect.top - heroRect.bottom,
                photoTop: photoRect.top,
                blurbTop: blurbRect.top,
                scrollWidth: document.documentElement.scrollWidth
              };
            }
            """
        )
        context.close()
        return metrics

    def test_desktop_home_spacing_and_alignment(self):
        metrics = self._capture_metrics(1200, 900)
        self.assertIsNotNone(metrics, "Desktop metrics unavailable for Home spacing test.")

        gap = metrics["gap"]
        self.assertGreaterEqual(gap, 24, f"Desktop gap too small: {gap}px (expected >= 24px)")
        self.assertLessEqual(gap, 72, f"Desktop gap too large: {gap}px (expected <= 72px)")

        delta = abs(metrics["photoTop"] - metrics["blurbTop"])
        self.assertLessEqual(
            delta,
            2,
            f"Desktop photo/blurb top misalignment: {delta}px (expected <= 2px)",
        )

    def test_mobile_home_spacing_and_overflow(self):
        viewport_width = 390
        metrics = self._capture_metrics(viewport_width, 844)
        self.assertIsNotNone(metrics, "Mobile metrics unavailable for Home spacing test.")

        gap = metrics["gap"]
        self.assertGreaterEqual(gap, 16, f"Mobile gap too small: {gap}px (expected >= 16px)")
        self.assertLessEqual(gap, 64, f"Mobile gap too large: {gap}px (expected <= 64px)")

        self.assertLessEqual(
            metrics["scrollWidth"],
            viewport_width + 1,
            f"Mobile horizontal overflow detected: scrollWidth={metrics['scrollWidth']} viewport={viewport_width}",
        )


if __name__ == "__main__":
    unittest.main()
