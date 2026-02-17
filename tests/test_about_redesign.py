import unittest
from pathlib import Path


class AboutRedesignTest(unittest.TestCase):
    """Validate About hybrid redesign content blocks and global footer attribution."""

    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parent.parent
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
        """Ensure the required About page section structure is present."""
        self.assertIn('<main class="about-main">', self.about_html)
        for section in ("about-hero", "about-timeline", "about-philosophy"):
            self.assertIn(f'class="section {section}"', self.about_html)

    def test_timeline_and_shared_bullet_usage(self):
        """Ensure timeline count and shared service-list bullets are used."""
        self.assertEqual(self.about_html.count('class="timeline-item"'), 3)
        self.assertGreaterEqual(self.about_html.count('<ul class="service-list">'), 5)

    def test_pmp_and_css_blocks_present(self):
        """Ensure credential statement and required style blocks exist."""
        self.assertIn(".about-main", self.about_css)
        self.assertIn(".timeline", self.about_css)
        self.assertIn(".about-philosophy", self.about_css)
        self.assertIn(".footer-meta", self.site_css)
        self.assertIn(".footer-primary", self.site_css)
        self.assertIn(".about-hero::after", self.about_css)
        self.assertRegex(self.about_css, r"\.timeline-marker\s*\{[^}]*width:\s*12px;[^}]*height:\s*12px;")

    def test_embedded_operating_leadership_section_replaces_today(self):
        """Ensure the close section uses the new heading and copy."""
        self.assertNotIn("<h2>TODAY</h2>", self.about_html)
        self.assertIn("<h3>Embedded Operating Leadership</h3>", self.about_html)
        self.assertIn(
            "This work shows up where scale, transition, or complexity begin to strain execution.",
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
