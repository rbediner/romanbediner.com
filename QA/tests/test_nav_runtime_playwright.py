import contextlib
import functools
import http.server
import importlib.util
import socketserver
import threading
import unittest
from pathlib import Path

PLAYWRIGHT_AVAILABLE = importlib.util.find_spec("playwright") is not None
# QA/tests is nested one level under the repository root.
ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(PLAYWRIGHT_AVAILABLE, "playwright is not installed")
class NavRuntimePlaywrightTest(unittest.TestCase):
    """Runtime navigation regression checks across canonical routes."""

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

    def test_nav_links_and_snapshot_stability(self):
        # Home removed from nav in 2026 redesign; Connect renders as "Connect →" (CTA button).
        expected_labels = ["About", "Framework", "Resources", "Services", "Connect \u2192"]
        expected_hrefs = ["/about/", "/framework/", "/resources/", "/services/", "/connect/"]
        routes = ["/", "/about/", "/services/", "/framework/", "/resources/", "/resources/ai-enabled-operations-framework-summary/", "/connect/"]

        baseline_header = None

        for route in routes:
            context = self.browser.new_context()
            page = context.new_page()
            page.goto(f"http://127.0.0.1:{self.port}{route}", wait_until="networkidle")

            labels = page.eval_on_selector_all(".site-nav a", "nodes => nodes.map(n => n.textContent.trim())")
            hrefs = page.eval_on_selector_all(".site-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")
            self.assertEqual(labels, expected_labels, f"Desktop nav labels mismatch on {route}")
            self.assertEqual(hrefs, expected_hrefs, f"Desktop nav hrefs mismatch on {route}")
            desktop_active = page.eval_on_selector_all(".site-nav a.active", "nodes => nodes.map(n => n.getAttribute('href'))")
            # Homepage has no active link — Home was removed from NAV_LINKS in 2026 redesign.
            expected_active_count = 0 if route == "/" else 1
            self.assertEqual(len(desktop_active), expected_active_count, f"Desktop nav active link count mismatch on {route}")

            mobile_labels = page.eval_on_selector_all("#mobile-nav a", "nodes => nodes.map(n => n.textContent.trim())")
            mobile_hrefs = page.eval_on_selector_all("#mobile-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")
            self.assertEqual(mobile_labels, expected_labels, f"Mobile nav labels mismatch on {route}")
            self.assertEqual(mobile_hrefs, expected_hrefs, f"Mobile nav hrefs mismatch on {route}")
            mobile_active = page.eval_on_selector_all("#mobile-nav a.active", "nodes => nodes.map(n => n.getAttribute('href'))")
            self.assertEqual(len(mobile_active), expected_active_count, f"Mobile nav active link count mismatch on {route}")

            # Snapshot normalized header markup to detect structural drift.
            header_html = page.eval_on_selector(
                "header.site-header",
                "node => node.outerHTML.replace(/\s+/g, ' ').replace(/src=\"[^\"]*mainlogo-blue-white.jpg\"/g, 'src=\"LOGO\"').replace(/class=\"([^\"]*?)active([^\"]*?)\"/g, 'class=\"$1$2\"').replace(/ aria-current=\"page\"/g, '').replace(/ class=\"\"/g, '').replace(/class=\"([^\"]*?) \"/g, 'class=\"$1\"').trim()",
            )
            self.assertIsNotNone(header_html, f"Missing header on {route}")

            if baseline_header is None:
                baseline_header = header_html
            else:
                self.assertEqual(header_html, baseline_header, f"Header structure mismatch on {route}")

            context.close()

    def test_insights_link_persists_across_route_clicks(self):
        routes = ["/", "/about/", "/services/", "/framework/", "/resources/", "/resources/ai-enabled-operations-framework-summary/", "/connect/"]

        for route in routes:
            context = self.browser.new_context()
            page = context.new_page()
            page.goto(f"http://127.0.0.1:{self.port}{route}", wait_until="networkidle")

            desktop_before = page.eval_on_selector_all(".site-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")
            mobile_before = page.eval_on_selector_all("#mobile-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")
            self.assertIn("/framework/", desktop_before, f"Desktop nav missing /framework/ on {route}")
            self.assertIn("/framework/", mobile_before, f"Mobile nav missing /framework/ on {route}")

            page.click('.site-nav a[href="/framework/"]')
            page.wait_for_url(f"http://127.0.0.1:{self.port}/framework/")

            desktop_after = page.eval_on_selector_all(".site-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")
            mobile_after = page.eval_on_selector_all("#mobile-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")
            self.assertIn("/framework/", desktop_after, f"Desktop nav lost /framework/ after click from {route}")
            self.assertIn("/framework/", mobile_after, f"Mobile nav lost /framework/ after click from {route}")

            insights_label_count = page.eval_on_selector_all(
                '.site-nav a[href="/framework/"]',
                "nodes => nodes.filter(n => n.textContent.trim() === 'Framework').length",
            )
            self.assertEqual(insights_label_count, 1, f"Framework label mismatch after navigation from {route}")

            context.close()


if __name__ == "__main__":
    unittest.main()
