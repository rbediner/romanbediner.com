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
class HomeNavConsistencyPlaywrightTest(unittest.TestCase):
    """Route-wide nav consistency checks plus Home header nav telemetry guard."""

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

    def test_header_nav_consistent_across_canonical_routes(self):
        # Home removed from nav in 2026 redesign; Connect renders as "Connect →" (CTA button).
        expected_labels = ["About", "Framework", "Resources", "Services", "Connect \u2192"]
        expected_hrefs = ["/about/", "/framework/", "/resources/", "/services/", "/connect/"]
        # None = homepage has no matching nav link (Home removed from NAV_LINKS).
        route_expectations = {
            "/": None,
            "/about/": "/about/",
            "/resources/": "/resources/",
            "/services/": "/services/",
            "/framework/": "/framework/",
            "/connect/": "/connect/",
        }

        for route, expected_active in route_expectations.items():
            context = self.browser.new_context()
            page = context.new_page()
            page.goto(f"http://127.0.0.1:{self.port}{route}", wait_until="networkidle")

            desktop_labels = page.eval_on_selector_all(".site-nav a", "nodes => nodes.map(n => n.textContent.trim())")
            desktop_hrefs = page.eval_on_selector_all(".site-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")
            mobile_labels = page.eval_on_selector_all("#mobile-nav a", "nodes => nodes.map(n => n.textContent.trim())")
            mobile_hrefs = page.eval_on_selector_all("#mobile-nav a", "nodes => nodes.map(n => n.getAttribute('href'))")

            self.assertEqual(desktop_labels, expected_labels, f"Desktop nav labels mismatch on {route}")
            self.assertEqual(desktop_hrefs, expected_hrefs, f"Desktop nav hrefs mismatch on {route}")
            self.assertEqual(mobile_labels, expected_labels, f"Mobile nav labels mismatch on {route}")
            self.assertEqual(mobile_hrefs, expected_hrefs, f"Mobile nav hrefs mismatch on {route}")

            desktop_active = page.eval_on_selector_all(".site-nav a.active", "nodes => nodes.map(n => n.getAttribute('href'))")
            mobile_active = page.eval_on_selector_all("#mobile-nav a.active", "nodes => nodes.map(n => n.getAttribute('href'))")
            if expected_active is None:
                self.assertEqual(desktop_active, [], f"Desktop active nav mismatch on {route} (no active link expected)")
                self.assertEqual(mobile_active, [], f"Mobile active nav mismatch on {route} (no active link expected)")
            else:
                self.assertEqual(desktop_active, [expected_active], f"Desktop active nav mismatch on {route}")
                self.assertEqual(mobile_active, [expected_active], f"Mobile active nav mismatch on {route}")

            context.close()

    def test_home_header_nav_click_telemetry(self):
        # Install GA stub before scripts execute and prevent navigation during click tests.
        context = self.browser.new_context()
        page = context.new_page()
        page.add_init_script(
            """
            window.__gtag_calls = [];
            window.gtag = (...args) => { window.__gtag_calls.push(args); };
            document.addEventListener(
              'click',
              (event) => {
                const link = event.target && event.target.closest('.site-nav a, #mobile-nav a');
                if (link) {
                  event.preventDefault();
                }
              },
              true
            );
            """
        )

        page.goto(f"http://127.0.0.1:{self.port}/", wait_until="networkidle")
        page.click('.site-nav a[href="/about/"]')
        page.click('.site-nav a[href="/framework/"]')

        nav_click_events = page.evaluate(
            """
            () => (window.__gtag_calls || [])
              .filter((args) => args[0] === 'event' && args[1] === 'nav_click')
              .map((args) => args[2] || {})
            """
        )
        context.close()

        self.assertGreaterEqual(len(nav_click_events), 2, "Expected at least two nav_click events on Home header.")
        self.assertTrue(
            all(event.get("location") == "header" for event in nav_click_events),
            "nav_click telemetry must include location='header'.",
        )
        labels = {event.get("label") for event in nav_click_events}
        self.assertIn("About", labels, "Missing nav_click label for About.")
        self.assertIn("Framework", labels, "Missing nav_click label for Framework.")


if __name__ == "__main__":
    unittest.main()
