import unittest
from pathlib import Path


class AboutRedesignTest(unittest.TestCase):
    """Validate About hybrid redesign content blocks and global footer attribution."""

    @classmethod
    def setUpClass(cls):
        # QA/tests is nested one level under the repository root.
        cls.root = Path(__file__).resolve().parents[2]
        cls.about_html = (cls.root / "about/index.html").read_text(encoding="utf-8")
        cls.site_css = (cls.root / "styles/site.css").read_text(encoding="utf-8")
        cls.about_css = (cls.root / "styles/about.css").read_text(encoding="utf-8")
        cls.canonical_pages = [
            "index.html",
            "about/index.html",
            "services/index.html",
            "connect/index.html",
            "insights/index.html",
        ]
        cls.footer_line = (
            "This site was developed with automated coding assistance from OpenAI Codex and complementary modern AI tooling."
        )
        cls.footer_primary = "© Roman Bediner, PMP"

    def test_about_structure_sections_present(self):
        """Ensure the current About manifesto hero and section wrappers are present."""
        self.assertIn('<main class="about-main">', self.about_html)
        self.assertIn('class="about-container"', self.about_html)
        self.assertIn('class="about-hero-refactored"', self.about_html)
        self.assertIn('class="manifesto-callout"', self.about_html)
        self.assertIn('class="callout-content"', self.about_html)
        self.assertNotIn('class="about-photo-wrapper"', self.about_html)
        self.assertNotIn('class="hero-photo"', self.about_html)
        for section in ("about-timeline", "about-philosophy"):
            self.assertIn(f'class="section {section}"', self.about_html)

    def test_timeline_and_shared_bullet_usage(self):
        """Ensure professional arc structure and shared service-list bullets are used."""
        self.assertIn('id="professional-arc"', self.about_html)
        self.assertEqual(self.about_html.count('class="era-header"'), 3)
        self.assertIn('class="lede-primary"', self.about_html)
        self.assertIn('class="lede-description"', self.about_html)
        self.assertIn(
            "Restoring clarity at the point of delivery through durable operating architecture.",
            self.about_html,
        )
        self.assertIn(
            "High-growth environments require the re-architecting of underlying systems - aligning engineering, product, and finance to turn strategy into reality.",
            self.about_html,
        )
        self.assertGreaterEqual(self.about_html.count('<ul class="service-list">'), 2)

    def test_pmp_and_css_blocks_present(self):
        """Ensure required About layout/style hooks and footer classes exist."""
        self.assertIn(".about-main", self.about_css)
        self.assertIn(".about-container", self.about_css)
        self.assertIn(".about-hero-refactored", self.about_css)
        self.assertIn(".manifesto-callout", self.about_css)
        self.assertIn(".callout-border", self.about_css)
        self.assertIn(".about-timeline", self.about_css)
        self.assertIn(".about-philosophy", self.about_css)
        self.assertIn(".philosophy-stack", self.about_css)
        self.assertIn(".manifesto-h1", self.about_css)
        self.assertIn(".lede-description", self.about_css)
        self.assertIn(".footer-meta", self.site_css)
        self.assertIn(".footer-primary", self.site_css)
        self.assertIn("#professional-arc", self.about_css)

    def test_embedded_operating_leadership_section_replaces_today(self):
        """Ensure the close section uses the new heading and copy."""
        self.assertNotIn("<h2>TODAY</h2>", self.about_html)
        self.assertIn("<h3>Embedded Operating Leadership</h3>", self.about_html)
        self.assertIn("<h3>Systems Over Heroics</h3>", self.about_html)
        self.assertIn(
            "This is not about advising from the sidelines. It is about embedding operational discipline directly into workflows, ensuring that delivery commitments are met reliably and strategy is translated into daily execution.",
            self.about_html,
        )

    def test_footer_meta_global_on_canonical_pages(self):
        """Ensure footer attribution is present globally and no em dashes are introduced."""
        for rel in self.canonical_pages:
            html = (self.root / rel).read_text(encoding="utf-8")
            self.assertIn(self.footer_line, html)
            self.assertIn(self.footer_primary, html)
            self.assertIn('class="footer-primary"', html)
            self.assertIn('class="footer-meta"', html)
            self.assertNotIn("—", html)


if __name__ == "__main__":
    unittest.main()
