import unittest
from pathlib import Path


class AboutRedesignTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[2]
        cls.about_html = (cls.root / "about/index.html").read_text(encoding="utf-8")
        cls.about_css = (cls.root / "styles/about.css").read_text(encoding="utf-8")

    def test_opening_copy_exists(self):
        for phrase in [
            "OPERATING BACKGROUND",
            "Execution is the Strategy",
            "The work is rarely blocked by strategy alone.",
            "The objective is not more process. It is a clearer, more accountable way for work to move from intent to outcome.",
        ]:
            self.assertIn(phrase, self.about_html)

    def test_five_chapter_structure_exists(self):
        self.assertEqual(self.about_html.count('class="era-header"'), 5)
        self.assertIn('id="enterprise-scale"', self.about_html)
        self.assertIn('id="global-delivery-leadership"', self.about_html)
        self.assertIn('id="global-infrastructure-advisory"', self.about_html)
        self.assertIn('id="ai-enabled-operating-systems"', self.about_html)
        self.assertIn('id="fractional-integration-leadership"', self.about_html)

    def test_old_philosophy_card_removed(self):
        self.assertNotIn('class="philosophy-stack"', self.about_html)
        self.assertNotIn('Systems Over Heroics', self.about_html)
        self.assertIn("The strongest operating systems make execution visible.", self.about_html)

    def test_supporting_css_exists(self):
        self.assertIn(".about-chapter-nav", self.about_css)
        self.assertIn(".arc-item", self.about_css)
        self.assertIn("border: 1px solid var(--border-color)", self.about_css)
        self.assertIn("@media (prefers-reduced-motion: reduce)", self.about_css)

    def test_editorial_chapter_panels_replace_timeline_decoration(self):
        self.assertEqual(self.about_html.count('class="arc-item-label"'), 5)
        self.assertEqual(self.about_html.count('class="arc-index" aria-hidden="true"'), 5)
        self.assertNotIn("timeline-orb", self.about_html)
        self.assertNotIn("timeline-orb", self.about_css)
        self.assertNotIn("<ul", self.about_html)
        self.assertNotIn("<ol", self.about_html)

    def test_chapter_heading_wrap_is_safe(self):
        self.assertIn("overflow-wrap: break-word", self.about_css)
        self.assertNotIn("white-space: nowrap", self.about_css)


if __name__ == "__main__":
    unittest.main()
