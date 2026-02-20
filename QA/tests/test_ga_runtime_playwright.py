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
        routes = ["/", "/about/", "/services/", "/connect/", "/insights/"]

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
            collect_hits = [u for u in requests if "google-analytics.com/g/collect" in u]

            self.assertGreaterEqual(
                len(gtag_loader_hits),
                1,
                f"GA gtag.js loader was not requested on route {route}",
            )
            self.assertGreaterEqual(
                len(collect_hits),
                1,
                f"GA collect request was not observed on route {route}",
            )

            csp_errors = [e for e in console_errors if "content security policy" in e.lower()]
            self.assertEqual(
                csp_errors,
                [],
                f"CSP console errors detected on route {route}: {csp_errors}",
            )

            context.close()

    def test_insights_expand_and_collapse_events_emit_collect_requests(self):
        context = self.browser.new_context()
        page = context.new_page()

        requests = []
        page.on("request", lambda request: requests.append(request.url))

        page.goto(f"http://127.0.0.1:{self.port}/insights/", wait_until="networkidle")
        page.wait_for_function("typeof window.gtag === 'function'")
        time.sleep(2)
        page.locator(".insight-toggle").first.click()
        time.sleep(2)
        page.locator(".insight-toggle").first.click()
        time.sleep(2)

        collect_requests = [u for u in requests if "google-analytics.com/g/collect" in u]
        toggle_hits = [u for u in collect_requests if "insight_toggle" in u]
        data_layer_events = page.evaluate(
            """() => (window.dataLayer || [])
              .map((item) => Array.from(item || []))
              .filter((item) => item.length >= 3 && item[0] === 'event')
              .map((item) => ({ name: item[1], payload: item[2] || {} }))"""
        )
        toggle_data_layer_hits = [e for e in data_layer_events if e.get("name") == "insight_toggle"]
        expand_data_layer_hits = [e for e in toggle_data_layer_hits if e.get("payload", {}).get("action") == "expand"]
        collapse_data_layer_hits = [e for e in toggle_data_layer_hits if e.get("payload", {}).get("action") == "collapse"]

        self.assertTrue(
            len(toggle_hits) >= 1 or len(toggle_data_layer_hits) >= 1,
            "No insight_toggle telemetry observed in collect requests or dataLayer.",
        )
        self.assertTrue(
            len(collapse_data_layer_hits) >= 1,
            "No insight_toggle collapse action observed in dataLayer.",
        )

        if len(toggle_hits) >= 1:
            self.assertTrue(
                any("ep.insight_slug=" in u and "ep.insight_title=" in u and "ep.action=" in u for u in toggle_hits),
                "insight_toggle collect payload is missing required parameters.",
            )
        else:
            self.assertTrue(
                any(
                    "insight_slug" in e.get("payload", {})
                    and "insight_title" in e.get("payload", {})
                    and "page_path" in e.get("payload", {})
                    for e in toggle_data_layer_hits
                ),
                "insight_toggle dataLayer payload is missing required parameters.",
            )

        context.close()


if __name__ == "__main__":
    unittest.main()
