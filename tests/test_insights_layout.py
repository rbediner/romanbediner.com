import re
import unittest
from pathlib import Path


class InsightsLayoutTest(unittest.TestCase):
    """Validate Insights card layout and centralized bullet styling."""

    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parent.parent
        cls.insights_html = (cls.root / "about/insights/index.html").read_text(encoding="utf-8")
        cls.site_css = (cls.root / "styles/site.css").read_text(encoding="utf-8")
        cls.insights_css = (cls.root / "styles/insights.css").read_text(encoding="utf-8")
        cls.services_css = (cls.root / "styles/services.css").read_text(encoding="utf-8")
        cls.services_html = (cls.root / "services/index.html").read_text(encoding="utf-8")

    def test_insights_has_grid_and_cards(self):
        """Ensure Insights page uses card grid classes."""
        self.assertIn('class="insights-grid"', self.insights_html)
        self.assertGreaterEqual(self.insights_html.count('class="insight-card card"'), 3)

    def test_insight_point_lists_use_shared_service_list_class(self):
        """Ensure each Insights points list opts into the shared Services list system."""
        matches = re.findall(r'<ul class="([^"]*insight-points[^"]*)">', self.insights_html)
        self.assertGreaterEqual(len(matches), 3)
        for classes in matches:
            self.assertIn("service-list", classes)

    def test_services_lists_do_not_use_legacy_bullet_class(self):
        """Ensure Services lists do not carry the legacy helper class."""
        matches = re.findall(r'<ul class="([^"]*service-list[^"]*)">', self.services_html)
        self.assertGreaterEqual(len(matches), 1)
        for classes in matches:
            self.assertNotIn("bullet-list", classes)

    def test_bullet_system_is_defined_in_site_css(self):
        """Ensure the shared bullet system and icon source are defined centrally."""
        self.assertIn(".service-list", self.site_css)
        self.assertIn(".service-list li::before", self.site_css)
        self.assertIn('background-image: url("/assets/icons/bullet.png");', self.site_css)

    def test_page_css_does_not_override_bullet_pseudo_elements(self):
        """Ensure page CSS files do not define competing bullet pseudo-element rules."""
        self.assertNotRegex(self.insights_css, r"insight-points\s+li::before")
        self.assertNotRegex(self.insights_css, r"bullet-list\s+li::before")
        self.assertNotRegex(self.services_css, r"service-list\s+li::before")
        self.assertNotRegex(self.services_css, r"bullet-list\s+li::before")

    def test_insights_uses_vertical_full_width_card_stack(self):
        """Ensure Insights layout stacks cards vertically instead of narrow grid columns."""
        self.assertRegex(self.insights_css, r"\.insights-grid\s*\{[^}]*display:\s*flex;")
        self.assertRegex(self.insights_css, r"\.insights-grid\s*\{[^}]*flex-direction:\s*column;")
        self.assertNotRegex(self.insights_css, r"grid-template-columns\s*:")

    def test_each_card_has_expandable_brief_section(self):
        """Ensure each card exposes the expand button and full-brief content container."""
        self.assertGreaterEqual(self.insights_html.count('class="expand-brief"'), 3)
        self.assertGreaterEqual(self.insights_html.count('class="brief-full"'), 3)
        self.assertIn('src="../../scripts/insights-briefs.js"', self.insights_html)


if __name__ == "__main__":
    unittest.main()
