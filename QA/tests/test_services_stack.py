import unittest
from pathlib import Path
import re


class ServicesStackTest(unittest.TestCase):
    """Validate the Services page stack layout, headings, and card count."""

    @classmethod
    def setUpClass(cls):
        # Resolve repository root from QA/tests.
        cls.root = Path(__file__).resolve().parents[2]
        cls.services_html = (cls.root / "services/index.html").read_text(encoding="utf-8")
        cls.services_css = (cls.root / "styles/services.css").read_text(encoding="utf-8")
        cls.site_css = (cls.root / "styles/site.css").read_text(encoding="utf-8")

    def test_service_stack_structure_present(self):
        """Ensure services use numbered svc-entry layout with five entries (2026 redesign)."""
        self.assertIn('class="svc-list"', self.services_html)
        self.assertEqual(self.services_html.count('<div class="svc-list">'), 1)
        # Services page should render exactly five numbered service entries.
        self.assertEqual(self.services_html.count('<div class="svc-entry">'), 5)

    def test_executive_callout_and_headings_present(self):
        """Ensure executive callout and restored service headings are rendered."""
        # shelf-callout removed from Services hero in 2026 redesign (replaced by lede-description paragraph)
        self.assertIn('class="brand-highlight"', self.services_html)
        self.assertIn('Services &amp; Expertise', self.services_html)
        self.assertIn('Executive Operating Leadership', self.services_html)
        self.assertIn('Fractional Operating Leadership', self.services_html)
        self.assertIn('Execution Leadership Coaching', self.services_html)
        self.assertIn('Strategic Program and Initiative Leadership', self.services_html)
        self.assertIn('Productizing Operations for Modern AI-Enabled Work', self.services_html)

    def test_stack_css_rules_present(self):
        """Ensure numbered entry, impact box, and icon rules exist in the services stylesheet."""
        self.assertIn('.svc-entry', self.services_css)
        self.assertIn('.svc-num', self.services_css)
        self.assertIn('.svc-h3', self.services_css)
        self.assertIn('.shelf-callout', self.site_css)
        self.assertIn('.svc-impact', self.services_css)
        self.assertIn('.svc-icon', self.services_css)

    def test_service_label_and_icon_scale(self):
        """Ensure service category labels and their icons remain legible."""
        label_match = re.search(r"\.svc-label\s*\{[\s\S]*?font-size:\s*(\d+)px;", self.services_css)
        icon_match = re.search(r"\.svc-icon\s*\{[\s\S]*?height:\s*(\d+)px;", self.services_css)
        self.assertIsNotNone(label_match, "Expected .svc-label font-size rule in services.css")
        self.assertIsNotNone(icon_match, "Expected .svc-icon height rule in services.css")

        self.assertGreaterEqual(int(label_match.group(1)), 13, "Service label font-size must stay at least 13px.")
        self.assertGreaterEqual(int(icon_match.group(1)), 22, "Service label icons must stay at least 22px tall.")

    def test_impact_label_font_size_exceeds_body_font_size(self):
        """Ensure IMPACT label remains larger than the supporting text for visual hierarchy."""
        label_match = re.search(r"\.svc-impact-label\s*\{[\s\S]*?font-size:\s*(\d+)px;", self.services_css)
        body_match = re.search(r"\.svc-impact\s+p\s*\{[\s\S]*?font-size:\s*(\d+)px;", self.services_css)
        self.assertIsNotNone(label_match, "Expected .svc-impact-label font-size rule in services.css")
        self.assertIsNotNone(body_match, "Expected .svc-impact p font-size rule in services.css")

        label_px = int(label_match.group(1))
        body_px = int(body_match.group(1))
        self.assertGreater(label_px, body_px, "IMPACT label font-size must be larger than IMPACT body text.")

    def test_bottom_navigation_anchor_present(self):
        """Ensure the Services page includes the transition anchor to Connect."""
        self.assertIn('class="next-page-nav"', self.services_html)
        self.assertIn('class="nav-anchor"', self.services_html)
        self.assertIn('href="/connect/"', self.services_html)
        self.assertIn('class="nav-label">Start the Conversation</span>', self.services_html)
        self.assertIn('class="nav-title sr-only">Transition to Connect</span>', self.services_html)
        self.assertIn('.next-page-nav', self.site_css)
        self.assertIn('.nav-anchor:hover .nav-title', self.site_css)


if __name__ == "__main__":
    unittest.main()
