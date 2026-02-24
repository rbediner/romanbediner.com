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
class HomeSpacingPlaywrightTest(unittest.TestCase):
    """Regression guards for Home master-grid spacing and photo alignment."""

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

    def _measure_home(self, width, height):
        # Reduced motion keeps geometry deterministic across test runs.
        context = self.browser.new_context(
            viewport={"width": width, "height": height},
            reduced_motion="reduce",
        )
        page = context.new_page()
        page.goto(f"http://127.0.0.1:{self.port}/", wait_until="networkidle")

        metrics = page.evaluate(
            """
            () => {
              const grid = document.querySelector('.master-layout-grid');
              const experience = document.querySelector('#experience');
              const experienceTitle = document.querySelector('#experience .section-title');
              const focus = document.querySelector('#areas-of-focus');
              const photo = document.querySelector('.master-photo img');
              const blurb = document.querySelector('.master-blurb p');
              const heading = document.querySelector('.master-head h1');
              if (!grid || !experience || !experienceTitle || !focus || !photo || !blurb || !heading) {
                return null;
              }
              const gridRect = grid.getBoundingClientRect();
              const experienceRect = experience.getBoundingClientRect();
              const experienceTitleRect = experienceTitle.getBoundingClientRect();
              const focusRect = focus.getBoundingClientRect();
              const photoRect = photo.getBoundingClientRect();
              const blurbRect = blurb.getBoundingClientRect();
              const headingRect = heading.getBoundingClientRect();
              return {
                headingHeight: headingRect.height,
                gridToExperienceGap: experienceRect.top - gridRect.top,
                headingGap: experienceTitleRect.top - blurbRect.bottom,
                photoGap: experienceTitleRect.top - photoRect.bottom,
                experienceToFocusGap: focusRect.top - experienceRect.bottom,
                photoTop: photoRect.top,
                blurbTop: blurbRect.top
              };
            }
            """
        )
        context.close()
        return metrics

    def test_desktop_spacing_guard(self):
        metrics = self._measure_home(1200, 900)
        self.assertIsNotNone(metrics, "Desktop metrics unavailable.")
        self.assertLessEqual(metrics["headingHeight"], 52, f"Desktop H1 appears to wrap: {metrics['headingHeight']}px")
        gap = metrics["headingGap"]
        self.assertGreaterEqual(gap, 40, f"Desktop blurb-to-experience heading gap too small: {gap}px")
        self.assertLessEqual(gap, 96, f"Desktop blurb-to-experience heading gap too large: {gap}px")
        self.assertGreaterEqual(
            metrics["experienceToFocusGap"],
            40,
            f"Desktop experience-to-focus gap too small: {metrics['experienceToFocusGap']}px",
        )
        self.assertLessEqual(
            metrics["experienceToFocusGap"],
            96,
            f"Desktop experience-to-focus gap too large: {metrics['experienceToFocusGap']}px",
        )

    def test_mobile_spacing_guard(self):
        metrics = self._measure_home(390, 844)
        self.assertIsNotNone(metrics, "Mobile metrics unavailable.")
        gap = metrics["photoGap"]
        self.assertGreaterEqual(gap, 24, f"Mobile photo-to-experience heading gap too small: {gap}px")
        self.assertLessEqual(gap, 96, f"Mobile photo-to-experience heading gap too large: {gap}px")

    def test_hero_alignment_guard(self):
        metrics = self._measure_home(1200, 900)
        self.assertIsNotNone(metrics, "Desktop metrics unavailable for alignment check.")
        delta = abs(metrics["photoTop"] - metrics["blurbTop"])
        self.assertLessEqual(
            delta,
            2,
            f"Hero photo top is not aligned to blurb first line: {delta}px",
        )


if __name__ == "__main__":
    unittest.main()
