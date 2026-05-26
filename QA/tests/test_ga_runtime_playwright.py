import contextlib
import functools
import http.server
import importlib.util
import socketserver
import threading
import time
import unittest
from pathlib import Path


PLAYWRIGHT_AVAILABLE = importlib.util.find_spec("playwright") is not None
# QA/tests is nested one level under the repository root.
ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(PLAYWRIGHT_AVAILABLE, "playwright is not installed")
class GARuntimePlaywrightTest(unittest.TestCase):
    """Runtime GA validation using a real browser against a local static server."""

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

    def test_ga_loader_and_collect_requests_fire(self):
        routes = ["/", "/about/", "/services/", "/framework/", "/resources/", "/resources/ai-enabled-operations-framework-summary/", "/resources/pasteflow/", "/connect/"]

        for route in routes:
            context = self.browser.new_context()
            page = context.new_page()

            requests = []
            console_errors = []

            page.on("request", lambda request: requests.append(request.url))
            page.on(
                "console",
                lambda msg: console_errors.append(msg.text)
                if msg.type == "error"
                else None,
            )

            page.goto(f"http://127.0.0.1:{self.port}{route}", wait_until="networkidle")
            time.sleep(2)

            gtag_loader_hits = [u for u in requests if "googletagmanager.com/gtag/js" in u]
            collect_hits = [
                u for u in requests
                if "google-analytics.com/g/collect" in u or "stats.g.doubleclick.net/g/collect" in u
            ]
            blocked_collect_errors = [
                e for e in console_errors
                if "stats.g.doubleclick.net/g/collect" in e.lower()
            ]

            self.assertGreaterEqual(
                len(gtag_loader_hits),
                1,
                f"GA gtag.js loader was not requested on route {route}",
            )
            self.assertTrue(
                len(collect_hits) >= 1 or len(blocked_collect_errors) >= 1,
                f"GA collect request (or blocked collect evidence) was not observed on route {route}",
            )

            csp_errors = [
                e for e in console_errors
                if "content security policy" in e.lower() and "stats.g.doubleclick.net/g/collect" not in e.lower()
            ]
            self.assertEqual(
                csp_errors,
                [],
                f"CSP console errors detected on route {route}: {csp_errors}",
            )

            context.close()

    def test_framework_stage_anchor_navigation_updates_hash(self):
        context = self.browser.new_context()
        page = context.new_page()

        requests = []
        console_errors = []
        page.on("request", lambda request: requests.append(request.url))
        page.on(
            "console",
            lambda msg: console_errors.append(msg.text)
            if msg.type == "error"
            else None,
        )

        page.goto(f"http://127.0.0.1:{self.port}/framework/", wait_until="networkidle")
        page.wait_for_function("typeof window.gtag === 'function'")
        time.sleep(1)

        expected_order = ["#opportunity", "#design", "#integration", "#execution", "#signals", "#evolution"]
        for anchor in expected_order:
            page.locator(f'.framework-diagram .framework-progress-link[href="{anchor}"]').click()
            page.wait_for_function("anchor => window.location.hash === anchor", arg=anchor)

        collect_requests = [
            u for u in requests
            if "google-analytics.com/g/collect" in u or "stats.g.doubleclick.net/g/collect" in u
        ]
        blocked_collect_errors = [
            e for e in console_errors
            if "stats.g.doubleclick.net/g/collect" in e.lower()
        ]
        self.assertTrue(
            len(collect_requests) >= 1 or len(blocked_collect_errors) >= 1,
            "Framework stage navigation should still retain GA collect activity on page.",
        )

        context.close()

    def test_framework_sections_match_stage_navigation(self):
        context = self.browser.new_context()
        page = context.new_page()

        page.goto(f"http://127.0.0.1:{self.port}/framework/", wait_until="networkidle")
        page.wait_for_function("typeof window.gtag === 'function'")
        stage_hrefs = page.eval_on_selector_all(".framework-diagram .framework-progress-link", "nodes => nodes.map(n => n.getAttribute('href'))")
        section_ids = page.eval_on_selector_all(".framework-section", "nodes => nodes.map(n => `#${n.id}`)")
        legacy_toggles = page.locator(".insight-toggle").count()

        self.assertEqual(
            section_ids,
            ["#opportunity", "#design", "#integration", "#execution", "#signals", "#evolution"],
            "Framework sections should render the six canonical stage anchors in order.",
        )
        self.assertEqual(stage_hrefs, section_ids, "Stage navigation href order should match section anchors.")
        self.assertEqual(legacy_toggles, 0, "Framework page must not render legacy insight toggles.")

        context.close()


if __name__ == "__main__":
    unittest.main()
