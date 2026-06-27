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
    """Hard numeric guardrails for Home master-grid spacing and geometry."""

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
              const grid = document.querySelector('.master-layout-grid');
              const experience = document.querySelector('#experience');
              const experienceTitle = document.querySelector('#experience .section-title');
              const focus = document.querySelector('#areas-of-focus');
              const photo = document.querySelector('.master-photo img');
              // Only the prose blurb paragraphs are direct children; the experience-logo
              // label/qualifier live inside a nested section and must not be treated as blurb copy.
              const blurbParagraphs = document.querySelectorAll('.master-blurb > p');
              const blurbBlock = document.querySelector('.master-blurb');
              const heading = document.querySelector('.master-head h1');
              const blurbFirst = blurbParagraphs.length ? blurbParagraphs[0] : null;
              // Measure from the bottom of the whole left-column block (including the logo band).
              const blurbLast = blurbBlock;
              if (!grid || !experience || !experienceTitle || !focus || !photo || !blurbFirst || !blurbLast || !heading) {
                return null;
              }
              const gridRect = grid.getBoundingClientRect();
              const expRect = experience.getBoundingClientRect();
              const expTitleRect = experienceTitle.getBoundingClientRect();
              const focusRect = focus.getBoundingClientRect();
              const photoRect = photo.getBoundingClientRect();
              const blurbFirstRect = blurbFirst.getBoundingClientRect();
              const blurbLastRect = blurbLast.getBoundingClientRect();
              const headingRect = heading.getBoundingClientRect();
              return {
                headingHeight: headingRect.height,
                gridToExperienceGap: expRect.top - gridRect.top,
                blurbToExperienceGap: expTitleRect.top - blurbLastRect.bottom,
                photoToExperienceGap: expTitleRect.top - photoRect.bottom,
                experienceToFocusGap: focusRect.top - expRect.bottom,
                photoTop: photoRect.top,
                blurbTop: blurbFirstRect.top,
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

        # Desktop headline should stay on a single line. Threshold raised in 2026 redesign:
        # 54px font × 1.05 line-height ≈ 57px; 80px headroom catches Cormorant Garamond rendering.
        self.assertLessEqual(metrics["headingHeight"], 80, f"Desktop H1 appears to wrap: {metrics['headingHeight']}px")
        # Experience should sit below blurb on tight grid rhythm with no giant void.
        self.assertGreaterEqual(
            metrics["blurbToExperienceGap"],
            40,
            f"Desktop blurb-to-experience gap too small: {metrics['blurbToExperienceGap']}px",
        )
        self.assertLessEqual(
            metrics["blurbToExperienceGap"],
            96,
            f"Desktop blurb-to-experience gap too large: {metrics['blurbToExperienceGap']}px",
        )
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

        self.assertGreaterEqual(
            metrics["photoToExperienceGap"],
            24,
            f"Mobile photo-to-experience gap too small: {metrics['photoToExperienceGap']}px",
        )
        self.assertLessEqual(
            metrics["photoToExperienceGap"],
            96,
            f"Mobile photo-to-experience gap too large: {metrics['photoToExperienceGap']}px",
        )

        self.assertLessEqual(
            metrics["scrollWidth"],
            viewport_width + 1,
            f"Mobile horizontal overflow detected: scrollWidth={metrics['scrollWidth']} viewport={viewport_width}",
        )


if __name__ == "__main__":
    unittest.main()
