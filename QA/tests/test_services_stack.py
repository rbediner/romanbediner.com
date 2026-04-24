import unittest
from pathlib import Path


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
        """Ensure services use a stack container with five restored cards."""
        self.assertIn('class="service-stack"', self.services_html)
        self.assertEqual(self.services_html.count('<div class="service-stack">'), 1)
        # Services page should render exactly five service cards in the restored stack.
        self.assertEqual(self.services_html.count('<div class="service-card">'), 5)

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
        """Ensure stack, hover, and icon rules exist in the services stylesheet."""
        self.assertIn('.service-stack', self.services_css)
        self.assertIn('.service-header-row', self.services_css)
        self.assertIn('.shelf-callout', self.site_css)
        self.assertIn('.service-card:hover', self.services_css)
        self.assertIn('.service-icon', self.services_css)

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
