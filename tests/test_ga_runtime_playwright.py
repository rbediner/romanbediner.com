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
ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(PLAYWRIGHT_AVAILABLE, "playwright is not installed")
class GARuntimePlaywrightTest(unittest.TestCase):
    """Runtime GA validation using a real browser against a local static server."""

    @classmethod
    def setUpClass(cls):
        from playwright.sync_api import sync_playwright

        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
        cls.server = socketserver.TCPServer(("127.0.0.1", 0), handler)
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


if __name__ == "__main__":
    unittest.main()
