import re
import unittest
from pathlib import Path


class InsightsLayoutTest(unittest.TestCase):
    """Validate Insights structure, behavior, and shared bullet styling."""

    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parent.parent
        cls.insights_html = (cls.root / "insights/index.html").read_text(encoding="utf-8")
        cls.insights_css = (cls.root / "styles/insights.css").read_text(encoding="utf-8")
        cls.site_css = (cls.root / "styles/site.css").read_text(encoding="utf-8")
        cls.insights_script = (cls.root / "scripts/insights-briefs.js").read_text(encoding="utf-8")

    def test_cards_have_slug_title_and_toggle(self):
        """Ensure each insight card has a slug id, title, and collapsed toggle."""
        cards = re.findall(r'<section id="([a-z0-9-]+)" class="insight-card">([\s\S]*?)</section>', self.insights_html)
        self.assertGreaterEqual(len(cards), 3)

        seen = set()
        for slug, card_html in cards:
            self.assertTrue(slug)
            self.assertNotIn(slug, seen)
            seen.add(slug)
            self.assertRegex(card_html, r"<h2>[^<]+</h2>")
            self.assertRegex(card_html, r'class="insight-toggle"[^>]*aria-expanded="false"')
            self.assertIn('<ul class="service-list">', card_html)
            self.assertIn('<div class="insight-expanded">', card_html)

    def test_expand_collapse_css_rules(self):
        """Ensure expanded content is hidden by default and shown on expanded cards."""
        self.assertRegex(self.insights_css, r"\.insight-expanded\s*\{[^}]*display:\s*none;")
        self.assertRegex(self.insights_css, r"\.insight-card\.expanded\s+\.insight-expanded\s*\{[^}]*display:\s*block;")

    def test_hover_lift_and_spacing(self):
        """Ensure card hover lift and card spacing align with required behavior."""
        self.assertRegex(self.insights_css, r"\.insight-card\s*\{[^}]*transition:\s*transform 150ms ease;")
        self.assertRegex(self.insights_css, r"\.insight-card:hover\s*\{[^}]*transform:\s*translateY\(-2px\);")
        self.assertRegex(self.insights_css, r"\.insight-card \+ \.insight-card\s*\{[^}]*margin-top:\s*64px;")

    def test_shared_bullets_follow_orb_spec(self):
        """Ensure global orb bullet spec is centralized in site.css."""
        self.assertRegex(self.site_css, r"\.service-list li::before\s*\{[^}]*width:\s*12px;")
        self.assertRegex(self.site_css, r"\.service-list li::before\s*\{[^}]*height:\s*12px;")
        self.assertRegex(self.site_css, r"\.service-list li::before\s*\{[^}]*margin-right:\s*10px;")
        self.assertIn('background-image: url("/icons/bullet.png");', self.site_css)

    def test_ga_event_on_expand_contract(self):
        """Ensure script sends insight_expand only for expansion and guards gtag."""
        self.assertIn("gtag('event', 'insight_expand'", self.insights_script)
        self.assertIn("if (isExpanded && typeof gtag === 'function')", self.insights_script)
        self.assertIn("insight_slug", self.insights_script)
        self.assertIn("insight_title", self.insights_script)


if __name__ == "__main__":
    unittest.main()
