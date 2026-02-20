import re
import unittest
from pathlib import Path


class InsightsLayoutTest(unittest.TestCase):
    """Validate Insights structure, behavior, and shared bullet styling."""

    @classmethod
    def setUpClass(cls):
        # QA/tests is nested one level under the repository root.
        cls.root = Path(__file__).resolve().parents[2]
        cls.insights_html = (cls.root / "insights/index.html").read_text(encoding="utf-8")
        cls.insights_css = (cls.root / "styles/insights.css").read_text(encoding="utf-8")
        cls.site_css = (cls.root / "styles/site.css").read_text(encoding="utf-8")
        cls.insights_script = (cls.root / "scripts/insights-toggle.js").read_text(encoding="utf-8")

    def test_cards_have_slug_title_and_toggle(self):
        """Ensure each insight card has a slug id, title, and collapsed toggle."""
        cards = re.findall(r'<article id="([a-z0-9-]+)" class="insight-card">([\s\S]*?)</article>', self.insights_html)
        self.assertGreaterEqual(len(cards), 3)

        seen = set()
        for slug, card_html in cards:
            self.assertTrue(slug)
            self.assertNotIn(slug, seen)
            seen.add(slug)
            self.assertRegex(card_html, r"<h2>[^<]+</h2>")
            self.assertRegex(card_html, r'class="insight-toggle"[^>]*aria-expanded="(true|false)"')
            self.assertIn('<ul class="service-list">', card_html)
            self.assertRegex(card_html, r'id="[a-z0-9-]+-content"\s+class="brief-content"')

    def test_summary_and_bullets_stay_outside_hidden_content(self):
        """Guardrail: summary and bullets must remain visible when a card is collapsed."""
        cards = re.findall(r'<article id="([a-z0-9-]+)" class="insight-card">([\s\S]*?)</article>', self.insights_html)
        self.assertGreaterEqual(len(cards), 3)

        for slug, card_html in cards:
            content_marker = f'id="{slug}-content" class="brief-content'
            content_start = card_html.find(content_marker)
            summary_start = card_html.find('<p class="insight-summary">')
            list_start = card_html.find('<ul class="service-list">')
            self.assertGreaterEqual(content_start, 0, f"{slug} is missing brief-content marker.")
            self.assertGreaterEqual(summary_start, 0, f"{slug} is missing insight summary.")
            self.assertGreaterEqual(list_start, 0, f"{slug} is missing service list.")
            self.assertLess(summary_start, content_start, f"{slug} summary must be outside hidden brief-content.")
            self.assertLess(list_start, content_start, f"{slug} service-list must be outside hidden brief-content.")

    def test_expand_collapse_css_rules(self):
        """Ensure brief content region has dedicated styling."""
        self.assertRegex(self.insights_css, r"\.brief-content\s*\{[^}]*margin-top:\s*16px;")

    def test_hover_lift_and_spacing(self):
        """Ensure card hover lift and card spacing align with required behavior."""
        self.assertRegex(self.insights_css, r"\.insight-card\s*\{[^}]*transition:\s*transform 180ms ease, box-shadow 180ms ease;")
        self.assertRegex(self.insights_css, r"\.insight-card:hover\s*\{[^}]*transform:\s*translateY\(-4px\);")
        self.assertRegex(self.insights_css, r"\.insight-card \+ \.insight-card\s*\{[^}]*margin-top:\s*64px;")
        self.assertRegex(self.insights_css, r"\.insight-accent\s*\{[^}]*width:\s*56px;")
        self.assertRegex(self.insights_css, r"\.insight-accent\s*\{[^}]*height:\s*3px;")
        self.assertRegex(self.insights_css, r"\.insight-accent\s*\{[^}]*background:\s*rgba\(59,\s*108,\s*255,\s*0\.62\);")
        self.assertRegex(self.insights_css, r"\.insight-actions\s*\{[^}]*justify-content:\s*flex-end;")
        self.assertRegex(self.insights_css, r"\.insight-toggle\s*\{[^}]*border-radius:\s*999px;")

    def test_shared_bullets_follow_orb_spec(self):
        """Ensure global orb bullet spec is centralized in site.css."""
        self.assertRegex(self.site_css, r"\.service-list li::before\s*\{[^}]*width:\s*8px;")
        self.assertRegex(self.site_css, r"\.service-list li::before\s*\{[^}]*height:\s*8px;")
        self.assertRegex(self.site_css, r"\.service-list li::before\s*\{[^}]*margin-right:\s*14px;")
        self.assertIn('background-image: url("/icons/bullet.png");', self.site_css)

    def test_ga_event_on_expand_contract(self):
        """Ensure script sends required insight_toggle GA event payload fields."""
        self.assertIn("window.gtag('event', 'insight_toggle'", self.insights_script)
        self.assertIn("insight_slug", self.insights_script)
        self.assertIn("insight_title", self.insights_script)
        self.assertIn("action: expanded ? 'collapse' : 'expand'", self.insights_script)
        self.assertIn("page_path: window.location.pathname", self.insights_script)


if __name__ == "__main__":
    unittest.main()
