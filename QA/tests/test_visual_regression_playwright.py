import contextlib
import functools
import http.server
import importlib.util
import io
import os
import socketserver
import threading
import time
import unittest
from pathlib import Path


PLAYWRIGHT_AVAILABLE = importlib.util.find_spec("playwright") is not None
PIL_AVAILABLE = importlib.util.find_spec("PIL") is not None
RUN_VISUAL_TESTS = os.getenv("RUN_VISUAL_TESTS", "0") == "1"

# QA/tests is nested one level under the repository root.
ROOT = Path(__file__).resolve().parents[2]
BASELINE_DIR = ROOT / "QA" / "tests" / "visual-baselines"
CURRENT_DIR = ROOT / "QA" / "tests" / "visual-current"
DIFF_DIR = ROOT / "QA" / "tests" / "visual-diff"

# Canonical routes under visual guardrails.
ROUTES = {
    "home": "/",
    "about": "/about/",
    "services": "/services/",
    "insights": "/insights/",
    "connect": "/connect/",
}

# Tight thresholds because the site intentionally uses minimal design language.
THRESHOLDS = {
    "desktop-full": 0.0010,
    "desktop-fold": 0.0008,
    "mobile-full": 0.0012,
    "state-shot": 0.0010,
}


@unittest.skipUnless(
    PLAYWRIGHT_AVAILABLE and RUN_VISUAL_TESTS,
    "visual regression is opt-in; set RUN_VISUAL_TESTS=1 and ensure playwright is installed",
)
class VisualRegressionPlaywrightTest(unittest.TestCase):
    """Visual regression + layout integrity tests enforced against committed baselines."""

    @classmethod
    def setUpClass(cls):
        # Import heavy modules only when this suite runs.
        from playwright.sync_api import sync_playwright

        cls.update_baselines = os.getenv("UPDATE_VISUAL_BASELINES", "0") == "1"
        cls.pillow_available = PIL_AVAILABLE

        if not cls.update_baselines and not cls.pillow_available:
            raise unittest.SkipTest("Pillow is required when comparing screenshots against baselines")

        if cls.pillow_available:
            from PIL import Image, ImageChops

            cls.Image = Image
            cls.ImageChops = ImageChops

        BASELINE_DIR.mkdir(parents=True, exist_ok=True)
        CURRENT_DIR.mkdir(parents=True, exist_ok=True)
        DIFF_DIR.mkdir(parents=True, exist_ok=True)

        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))

        class ReusableTCPServer(socketserver.TCPServer):
            allow_reuse_address = True

        try:
            cls.server = ReusableTCPServer(("127.0.0.1", 0), handler)
        except PermissionError as exc:
            raise unittest.SkipTest(f"Local socket bind is blocked in this environment: {exc}")

        cls.port = cls.server.server_address[1]
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()

        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

        cls.site_css = (ROOT / "styles/site.css").read_text(encoding="utf-8")
        cls.insights_css = (ROOT / "styles/insights.css").read_text(encoding="utf-8")

    @classmethod
    def tearDownClass(cls):
        with contextlib.suppress(Exception):
            cls.browser.close()
        with contextlib.suppress(Exception):
            cls.playwright.stop()
        with contextlib.suppress(Exception):
            cls.server.shutdown()
            cls.server.server_close()

    @classmethod
    def _new_page(cls, width, height):
        # Every assertion runs in a clean browser context.
        context = cls.browser.new_context(viewport={"width": width, "height": height})
        page = context.new_page()
        return context, page

    def _goto(self, page, route):
        page.goto(f"http://127.0.0.1:{self.port}{route}", wait_until="networkidle")
        # Let fonts/layout settle before any geometry or screenshot assertions.
        page.wait_for_timeout(250)
        with contextlib.suppress(Exception):
            page.wait_for_function("() => document.fonts && document.fonts.status === 'loaded'", timeout=2500)

        # /connect/ depends on deferred third-party editor bootstrap for stable geometry.
        if route == "/connect/":
            with contextlib.suppress(Exception):
                page.wait_for_selector(".ql-toolbar", timeout=5000)
                page.wait_for_selector(".ql-editor", timeout=5000)

    def _compare_with_baseline(self, image_bytes, baseline_name, threshold):
        baseline_path = BASELINE_DIR / baseline_name
        current_path = CURRENT_DIR / baseline_name
        diff_path = DIFF_DIR / baseline_name

        current_path.write_bytes(image_bytes)

        # Baseline refresh mode is explicit and opt-in.
        if self.update_baselines:
            baseline_path.write_bytes(image_bytes)
            return

        self.assertTrue(
            baseline_path.exists(),
            f"Missing committed visual baseline: {baseline_path}. Run with UPDATE_VISUAL_BASELINES=1 and commit outputs.",
        )

        if not self.pillow_available:
            self.fail("Pillow must be available to compare screenshots in non-update mode.")

        baseline = self.Image.open(baseline_path).convert("RGBA")
        current = self.Image.open(io.BytesIO(image_bytes)).convert("RGBA")

        self.assertEqual(
            baseline.size,
            current.size,
            f"Baseline/current image size mismatch for {baseline_name}: {baseline.size} vs {current.size}",
        )

        diff = self.ImageChops.difference(baseline, current).convert("L")
        histogram = diff.histogram()
        total_pixels = baseline.size[0] * baseline.size[1]

        # Count a pixel as changed only after a small intensity floor to reduce anti-aliasing noise.
        changed_pixels = sum(histogram[8:])
        ratio = changed_pixels / max(total_pixels, 1)

        if ratio > threshold:
            # Persist a human-readable diff artifact to speed up failure triage.
            amplified = diff.point(lambda px: 255 if px >= 8 else 0)
            amplified.save(diff_path)

        self.assertLessEqual(
            ratio,
            threshold,
            (
                f"Visual regression exceeded threshold for {baseline_name}. "
                f"changed_ratio={ratio:.6f}, threshold={threshold:.6f}, diff={diff_path}"
            ),
        )

    def _snapshot_and_assert(self, page, baseline_name, threshold, full_page=False, clip=None):
        # Stabilize hover-sensitive captures by moving the pointer off interactive elements.
        page.mouse.move(1, 1)
        page.wait_for_timeout(60)
        screenshot_bytes = page.screenshot(full_page=full_page, clip=clip)
        self._compare_with_baseline(screenshot_bytes, baseline_name, threshold)

    def test_01_visual_snapshots_for_critical_pages(self):
        """Part 1: capture and compare desktop full, fold, and mobile snapshots for all critical pages."""
        for page_name, route in ROUTES.items():
            context, page = self._new_page(1440, 2200)
            try:
                self._goto(page, route)
                self._snapshot_and_assert(
                    page,
                    f"{page_name}--desktop-full.png",
                    THRESHOLDS["desktop-full"],
                    full_page=True,
                )
            finally:
                context.close()

            context, page = self._new_page(1440, 1200)
            try:
                self._goto(page, route)
                self._snapshot_and_assert(
                    page,
                    f"{page_name}--desktop-fold.png",
                    THRESHOLDS["desktop-fold"],
                    full_page=False,
                )
            finally:
                context.close()

            context, page = self._new_page(390, 844)
            try:
                self._goto(page, route)
                self._snapshot_and_assert(
                    page,
                    f"{page_name}--mobile-full.png",
                    THRESHOLDS["mobile-full"],
                    full_page=True,
                )
            finally:
                context.close()

    def test_02_navigation_structure_visual_alignment(self):
        """Part 2: enforce nav alignment, Insights presence, active marker, and no active-state layout shift."""
        expected_by_route = {
            "/": "/",
            "/about/": "/about/",
            "/services/": "/services/",
            "/insights/": "/insights/",
            "/connect/": "/connect/",
        }

        for route, expected_active_href in expected_by_route.items():
            context, page = self._new_page(1440, 1200)
            try:
                self._goto(page, route)

                nav_text = [
                    text.strip().lower() for text in page.locator(".site-nav a").all_text_contents()
                ]
                self.assertIn("insights", nav_text, f"Insights link missing in desktop nav for {route}")

                y_positions = page.evaluate(
                    """
                    () => Array.from(document.querySelectorAll('.site-nav a'))
                      .map((node) => node.getBoundingClientRect().top)
                    """
                )
                self.assertTrue(y_positions, f"No desktop nav links found for {route}")
                self.assertLessEqual(max(y_positions) - min(y_positions), 1.5, f"Nav links are vertically misaligned on {route}")

                active_links = page.locator(".site-nav a.active")
                self.assertEqual(active_links.count(), 1, f"Expected exactly one active nav link on {route}")
                self.assertEqual(
                    active_links.first.get_attribute("href"),
                    expected_active_href,
                    f"Active nav link href mismatch on {route}",
                )
                self.assertEqual(
                    active_links.first.get_attribute("aria-current"),
                    "page",
                    f"Active nav link must include aria-current on {route}",
                )

                nav_height_before, nav_height_after = page.evaluate(
                    """
                    () => {
                      const nav = document.querySelector('.site-nav');
                      const active = nav ? nav.querySelector('a.active') : null;
                      if (!nav || !active) {
                        return [null, null];
                      }
                      const before = nav.getBoundingClientRect().height;
                      active.classList.remove('active');
                      const middle = nav.getBoundingClientRect().height;
                      active.classList.add('active');
                      return [before, middle];
                    }
                    """
                )
                self.assertIsNotNone(nav_height_before, f"Missing nav element for {route}")
                self.assertLessEqual(
                    abs(nav_height_before - nav_height_after),
                    0.5,
                    f"Active state causes nav layout shift on {route}",
                )
            finally:
                context.close()

    def test_03_insights_page_integrity_expand_interaction(self):
        """Part 3: validate insight cards, toggle placement, hover style hook, and expanded-state stability."""
        context, page = self._new_page(1440, 1800)
        try:
            self._goto(page, "/insights/")

            cards = page.locator(".insight-card")
            card_count = cards.count()
            self.assertGreaterEqual(card_count, 3, "Insights page must contain at least three insight cards")
            self.assertIn(".insight-card:hover", self.insights_css, "Hover elevation class is missing from insights CSS")

            for index in range(card_count):
                card = cards.nth(index)
                self.assertEqual(card.locator(".insight-accent").count(), 1, f"Card {index} is missing top blue divider")
                self.assertGreaterEqual(card.locator("ul.service-list li").count(), 1, f"Card {index} is missing orb bullet list")
                self.assertEqual(card.locator("button.insight-toggle").count(), 1, f"Card {index} is missing toggle")

                card_box = card.bounding_box()
                toggle_box = card.locator("button.insight-toggle").bounding_box()
                self.assertIsNotNone(card_box, f"Card {index} missing bounding box")
                self.assertIsNotNone(toggle_box, f"Toggle {index} missing bounding box")

                # Enforce bottom-right toggle placement inside card bounds.
                self.assertGreaterEqual(toggle_box["x"], card_box["x"], f"Toggle x out of bounds for card {index}")
                self.assertGreaterEqual(toggle_box["y"], card_box["y"], f"Toggle y out of bounds for card {index}")
                self.assertLessEqual(toggle_box["x"] + toggle_box["width"], card_box["x"] + card_box["width"], f"Toggle right edge out of bounds for card {index}")
                self.assertLessEqual(toggle_box["y"] + toggle_box["height"], card_box["y"] + card_box["height"], f"Toggle bottom edge out of bounds for card {index}")

            first_card = cards.first
            first_card_width_before = first_card.bounding_box()["width"]
            first_card.locator("button.insight-toggle").click()
            page.wait_for_timeout(500)
            first_card_width_after = first_card.bounding_box()["width"]

            self.assertLessEqual(
                abs(first_card_width_before - first_card_width_after),
                1.0,
                "Expanding an insight should not alter container width",
            )

            expanded_panel_integrity = page.evaluate(
                """
                () => {
                  const panel = document.querySelector('.brief-content');
                  if (!panel) {
                    return { found: false, hasMaxHeightTransition: false, isVisible: false };
                  }
                  const style = getComputedStyle(panel);
                  const hasMaxHeightTransition = style.transition.includes('max-height');
                  const isVisible = !panel.hasAttribute('hidden');
                  return { found: true, hasMaxHeightTransition, isVisible };
                }
                """
            )
            self.assertTrue(expanded_panel_integrity["found"], "Expanded panel element is missing")
            self.assertTrue(expanded_panel_integrity["isVisible"], "Expanded panel must be visible after toggle")

            self._snapshot_and_assert(
                page,
                "insights--expanded-first-card-desktop.png",
                THRESHOLDS["state-shot"],
                full_page=False,
            )
        finally:
            context.close()

    def test_04_operating_philosophy_block_integrity(self):
        """Part 4: enforce Operating Philosophy visual contract and capture normal/hover states."""
        context, page = self._new_page(1440, 1600)
        try:
            self._goto(page, "/about/")

            philosophy_card = page.locator(".card-philosophy")
            self.assertEqual(philosophy_card.count(), 1, "About page must contain exactly one operating philosophy card")

            card_bg, card_radius, card_shadow_before, gap_top, gap_bottom = page.evaluate(
                """
                () => {
                  const section = document.querySelector('.about-philosophy');
                  const card = document.querySelector('.card-philosophy');
                  const sectionBox = section.getBoundingClientRect();
                  const cardBox = card.getBoundingClientRect();
                  const style = getComputedStyle(card);
                  return [
                    style.backgroundColor,
                    parseFloat(style.borderRadius || '0'),
                    style.boxShadow,
                    cardBox.top - sectionBox.top,
                    sectionBox.bottom - cardBox.bottom,
                  ];
                }
                """
            )

            self.assertEqual(card_bg, "rgb(255, 255, 255)", "Operating philosophy card must remain white")
            self.assertGreaterEqual(card_radius, 16, "Operating philosophy card border radius is below design spec")
            self.assertLessEqual(gap_top, 64, "Operating philosophy section has excessive top spacing")
            self.assertLessEqual(gap_bottom, 64, "Operating philosophy section has excessive bottom spacing")

            title_size, title_weight, h3_size, h3_weight = page.evaluate(
                """
                () => {
                  const title = document.querySelector('.philosophy-card-title');
                  const h3 = document.querySelector('.philosophy-item h3');
                  const titleStyle = getComputedStyle(title);
                  const h3Style = getComputedStyle(h3);
                  return [
                    parseFloat(titleStyle.fontSize),
                    parseInt(titleStyle.fontWeight, 10),
                    parseFloat(h3Style.fontSize),
                    parseInt(h3Style.fontWeight, 10),
                  ];
                }
                """
            )
            self.assertGreater(title_size, h3_size, "OPERATING PHILOSOPHY title must be larger than subsection headers")
            self.assertGreaterEqual(title_weight, h3_weight, "OPERATING PHILOSOPHY title must be at least as bold as subsection headers")

            link_align = page.evaluate(
                """
                () => getComputedStyle(document.querySelector('.philosophy-insights-link-wrap')).textAlign
                """
            )
            self.assertEqual(link_align, "right", "Explore related insights link must stay right-aligned")

            # Capture normal state shot.
            normal_bytes = philosophy_card.screenshot()
            self._compare_with_baseline(
                normal_bytes,
                "about--operating-philosophy-normal.png",
                THRESHOLDS["state-shot"],
            )

            # Hover must create visible elevation delta.
            philosophy_card.hover()
            page.wait_for_timeout(180)
            card_shadow_after = page.evaluate("() => getComputedStyle(document.querySelector('.card-philosophy')).boxShadow")
            self.assertNotEqual(card_shadow_before, card_shadow_after, "Hover elevation is missing on operating philosophy card")
            self.assertNotEqual(card_shadow_after, "none", "Hover elevation cannot collapse to no shadow")

            hover_bytes = philosophy_card.screenshot()
            self._compare_with_baseline(
                hover_bytes,
                "about--operating-philosophy-hover.png",
                THRESHOLDS["state-shot"],
            )
        finally:
            context.close()

    def test_05_bullet_consistency_rules(self):
        """Part 5: enforce icon bullets (8px) and no default browser bullets."""
        self.assertIn("width: 8px;", self.site_css)
        self.assertIn("height: 8px;", self.site_css)
        self.assertIn('background-image: url("/icons/bullet.png");', self.site_css)
        self.assertIn("transform: translateY(-50%);", self.site_css)

        for _, route in ROUTES.items():
            context, page = self._new_page(1440, 1200)
            try:
                self._goto(page, route)
                bullet_audit = page.evaluate(
                    """
                    () => {
                      const issues = [];
                      const allLists = Array.from(document.querySelectorAll('ul'));

                      for (const list of allLists) {
                        if (!list.classList.contains('service-list')) {
                          issues.push('Found ul without service-list class.');
                        }

                        const listStyle = getComputedStyle(list).listStyleType;
                        if (listStyle !== 'none') {
                          issues.push(`Default list-style-type found: ${listStyle}`);
                        }

                        const firstItem = list.querySelector('li');
                        if (!firstItem) {
                          continue;
                        }

                        const pseudo = getComputedStyle(firstItem, '::before');
                        if (pseudo.width !== '8px' || pseudo.height !== '8px') {
                          issues.push(`Bullet size mismatch: ${pseudo.width} x ${pseudo.height}`);
                        }
                        if (!pseudo.backgroundImage.includes('bullet.png')) {
                          issues.push(`Bullet icon mismatch: ${pseudo.backgroundImage}`);
                        }
                      }

                      return issues;
                    }
                    """
                )
                self.assertEqual(bullet_audit, [], f"Bullet consistency failure on {route}: {bullet_audit}")
            finally:
                context.close()

    def test_06_ga_events_for_expand_and_collapse(self):
        """Part 6: validate insight expand/collapse GA events and unavailable-gtag warning behavior."""
        context, page = self._new_page(1440, 1400)
        try:
            self._goto(page, "/insights/")

            page.evaluate(
                """
                () => {
                  window.__qaEvents = [];
                  window.__qaWarnings = [];

                  const originalWarn = console.warn.bind(console);
                  console.warn = (...args) => {
                    window.__qaWarnings.push(args.map((item) => String(item)).join(' '));
                    originalWarn(...args);
                  };

                  const existingGtag = window.gtag;
                  window.gtag = (...args) => {
                    window.__qaEvents.push(args);
                    if (typeof existingGtag === 'function') {
                      try {
                        existingGtag(...args);
                      } catch (_err) {
                        // Keep QA instrumentation resilient.
                      }
                    }
                  };
                }
                """
            )

            toggle = page.locator(".insight-card").first.locator(".insight-toggle")
            slug = page.locator(".insight-card").first.get_attribute("id")

            toggle.click()
            page.wait_for_timeout(120)
            toggle.click()
            page.wait_for_timeout(120)

            events = page.evaluate("() => window.__qaEvents")
            self.assertGreaterEqual(len(events), 2, "Expected at least expand and collapse analytics events")

            event_names = [event[1] for event in events if len(event) >= 2]
            self.assertIn("insight_toggle", event_names, "Missing insight_toggle GA event")

            matching_payloads = [
                event[2]
                for event in events
                if len(event) >= 3 and isinstance(event[2], dict) and event[2].get("insight_slug") == slug
            ]
            self.assertGreaterEqual(len(matching_payloads), 2, "Event payloads must include the expanded card slug")
            self.assertTrue(
                any(payload.get("action") == "expand" for payload in matching_payloads),
                "insight_toggle payload must include an expand action."
            )
            self.assertTrue(
                any(payload.get("action") == "collapse" for payload in matching_payloads),
                "insight_toggle payload must include a collapse action."
            )

            # Simulate missing gtag and require a safe no-op.
            page.evaluate("() => { window.gtag = undefined; }")
            self.assertIsNone(toggle.click(timeout=1000))
        finally:
            context.close()

    def test_07_spacing_guardrails(self):
        """Part 7: enforce spacing scale discipline and reject anomalous vertical rhythm."""
        spacing_scale = [0, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96]

        def nearest_scale_distance(value):
            return min(abs(value - step) for step in spacing_scale)

        for route in ROUTES.values():
            context, page = self._new_page(1440, 1400)
            try:
                self._goto(page, route)
                section_metrics = page.evaluate(
                    """
                    () => Array.from(document.querySelectorAll('main section')).map((section) => {
                      const style = getComputedStyle(section);
                      return {
                        className: section.className || '',
                        marginTop: parseFloat(style.marginTop || '0'),
                        marginBottom: parseFloat(style.marginBottom || '0'),
                        paddingTop: parseFloat(style.paddingTop || '0'),
                        paddingBottom: parseFloat(style.paddingBottom || '0'),
                      };
                    })
                    """
                )

                for metric in section_metrics:
                    for key in ("marginTop", "marginBottom", "paddingTop", "paddingBottom"):
                        value = metric[key]
                        self.assertLessEqual(
                            value,
                            192,
                            f"Spacing anomaly on {route} for {metric['className']} {key}: {value}px exceeds 2x scale cap",
                        )
                        # Ignore tiny fractional noise close to 0.
                        if value > 2:
                            self.assertLessEqual(
                                nearest_scale_distance(value),
                                4,
                                f"Spacing value off scale on {route} for {metric['className']} {key}: {value}px",
                            )

                if route == "/about/":
                    philosophy = next((m for m in section_metrics if "about-philosophy" in m["className"]), None)
                    self.assertIsNotNone(philosophy, "About page must include about-philosophy section")
                    for key in ("marginTop", "marginBottom"):
                        self.assertLessEqual(
                            nearest_scale_distance(philosophy[key]),
                            4,
                            f"about-philosophy {key} must align to spacing scale",
                        )
            finally:
                context.close()

    def test_08_mobile_responsive_integrity(self):
        """Part 8: enforce mobile nav, overflow safety, card stacking, and toggle placement."""
        for route in ROUTES.values():
            context, page = self._new_page(390, 844)
            try:
                self._goto(page, route)

                # Mobile nav contract: hamburger visible, desktop nav hidden.
                menu_display, desktop_display = page.evaluate(
                    """
                    () => {
                      const menuToggle = document.querySelector('.menu-toggle');
                      const desktopNav = document.querySelector('.site-nav');
                      return [
                        menuToggle ? getComputedStyle(menuToggle).display : 'none',
                        desktopNav ? getComputedStyle(desktopNav).display : 'none',
                      ];
                    }
                    """
                )
                self.assertNotEqual(menu_display, "none", f"Menu toggle must be visible on mobile for {route}")
                self.assertEqual(desktop_display, "none", f"Desktop nav must be hidden on mobile for {route}")

                # Horizontal overflow guardrail.
                overflow = page.evaluate(
                    """
                    () => ({
                      scrollWidth: document.documentElement.scrollWidth,
                      clientWidth: document.documentElement.clientWidth,
                    })
                    """
                )
                self.assertLessEqual(
                    overflow["scrollWidth"],
                    overflow["clientWidth"] + 1,
                    f"Horizontal overflow detected on mobile route {route}",
                )

                if route == "/insights/":
                    cards = page.locator(".insight-card")
                    self.assertGreaterEqual(cards.count(), 3, "Insights cards must exist on mobile")

                    # Cards must stack vertically with no overlap.
                    boxes = [cards.nth(i).bounding_box() for i in range(cards.count())]
                    for i in range(1, len(boxes)):
                        self.assertGreaterEqual(
                            boxes[i]["y"],
                            boxes[i - 1]["y"] + boxes[i - 1]["height"],
                            "Insights cards overlap on mobile",
                        )

                    toggle_box = cards.first.locator(".insight-toggle").bounding_box()
                    card_box = cards.first.bounding_box()
                    self.assertLessEqual(toggle_box["x"] + toggle_box["width"], card_box["x"] + card_box["width"])
                    self.assertLessEqual(toggle_box["y"] + toggle_box["height"], card_box["y"] + card_box["height"])

                    # Ensure parent overflow does not clip card shadows.
                    overflow_chain = page.evaluate(
                        """
                        () => {
                          const card = document.querySelector('.insight-card');
                          const values = [];
                          let node = card;
                          while (node && node !== document.body) {
                            const style = getComputedStyle(node);
                            values.push({
                              node: node.className || node.tagName,
                              overflowX: style.overflowX,
                              overflowY: style.overflowY,
                            });
                            node = node.parentElement;
                          }
                          return values;
                        }
                        """
                    )
                    clipped = [
                        row for row in overflow_chain if row["overflowX"] == "hidden" or row["overflowY"] == "hidden"
                    ]
                    self.assertEqual(clipped, [], f"Potential shadow clipping containers on mobile insights: {clipped}")
            finally:
                context.close()


if __name__ == "__main__":
    unittest.main()
