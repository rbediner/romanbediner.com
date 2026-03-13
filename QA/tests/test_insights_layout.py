import re
import unittest
from pathlib import Path


class FrameworkLayoutTest(unittest.TestCase):
    """Validate Framework structure, flow indicators, and readability rules."""

    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[2]
        cls.framework_html = (cls.root / "framework/index.html").read_text(encoding="utf-8")
        cls.redirect_html = (cls.root / "insights/index.html").read_text(encoding="utf-8")
        cls.framework_css = (cls.root / "styles/framework.css").read_text(encoding="utf-8")

    def test_framework_has_six_sections_and_anchor_nav(self):
        section_ids = ["opportunity", "design", "integration", "execution", "signals", "evolution"]
        for section_id in section_ids:
            self.assertIn(f'id="{section_id}"', self.framework_html)
            self.assertIn(f'href="#{section_id}"', self.framework_html)

        self.assertEqual(self.framework_html.count('class="framework-section insight-card"'), 6)

    def test_flow_arrows_only_between_sections(self):
        self.assertEqual(self.framework_html.count('class="framework-arrow"'), 3)
        section_blocks = re.findall(r'<section id="[a-z-]+" class="framework-section insight-card">([\s\S]*?)</section>', self.framework_html)
        self.assertTrue(section_blocks)
        for block in section_blocks:
            self.assertNotIn('framework-arrow', block)

    def test_legacy_expand_collapse_removed(self):
        self.assertNotIn('insight-toggle', self.framework_html)
        self.assertNotIn('brief-content', self.framework_html)
        self.assertNotIn('insights-toggle.js', self.framework_html)

    def test_framework_css_readability_and_indicator_rules(self):
        self.assertRegex(self.framework_css, r"--framework-max-width:\s*860px;")
        self.assertRegex(self.framework_css, r"\.framework-progress-line\s*\{[^}]*height:\s*2px;[^}]*opacity:\s*0\.25;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress\s*\{[^}]*max-width:\s*700px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-progress-markers span\s*\{[^}]*width:\s*8px;[^}]*height:\s*8px;[^}]*opacity:\s*0\.5;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section \+ \.framework-section\s*\{[^}]*margin-top:\s*48px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section ul\s*\{[^}]*line-height:\s*1\.6;[^}]*margin-top:\s*14px;", re.S)
        self.assertRegex(self.framework_css, r"\.framework-section li\s*\{[^}]*margin-bottom:\s*10px;[^}]*max-width:\s*620px;", re.S)

    def test_redirect_page_points_to_framework(self):
        self.assertIn('http-equiv="refresh"', self.redirect_html)
        self.assertIn('url=/framework/', self.redirect_html)
        self.assertIn('rel="canonical" href="https://romanbediner.com/framework/"', self.redirect_html)


if __name__ == "__main__":
    unittest.main()
