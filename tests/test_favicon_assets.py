import unittest
from pathlib import Path


class FaviconAssetsTest(unittest.TestCase):
    """Validate generated favicon assets and page-level favicon references."""

    @classmethod
    def setUpClass(cls):
        # Resolve the repository root once for stable path checks in all tests.
        cls.root = Path(__file__).resolve().parent.parent
        cls.expected_assets = [
            cls.root / "assets/favicon/favicon-16x16.png",
            cls.root / "assets/favicon/favicon-32x32.png",
            cls.root / "assets/favicon/apple-touch-icon.png",
            cls.root / "assets/favicon/favicon.ico",
        ]
        cls.page_checks = [
            ("index.html", "assets/favicon/"),
            ("home/index.html", "../assets/favicon/"),
            ("about/index.html", "../assets/favicon/"),
            ("services/index.html", "../assets/favicon/"),
            ("connect/index.html", "../assets/favicon/"),
            ("about/insights/index.html", "../../assets/favicon/"),
        ]

    def test_favicon_assets_exist(self):
        """Ensure all required favicon output files exist."""
        for asset in self.expected_assets:
            self.assertTrue(asset.exists(), f"Missing favicon asset: {asset}")

    def test_pages_reference_favicon_set(self):
        """Ensure each page head references the full favicon set with correct relative paths."""
        for rel_page, base in self.page_checks:
            html = (self.root / rel_page).read_text(encoding="utf-8")
            self.assertIn(
                f'href="{base}favicon-32x32.png"',
                html,
                f"Missing 32x32 favicon reference in {rel_page}",
            )
            self.assertIn(
                f'href="{base}favicon-16x16.png"',
                html,
                f"Missing 16x16 favicon reference in {rel_page}",
            )
            self.assertIn(
                f'href="{base}apple-touch-icon.png"',
                html,
                f"Missing Apple touch icon reference in {rel_page}",
            )
            self.assertIn(
                f'href="{base}favicon.ico"',
                html,
                f"Missing ICO fallback reference in {rel_page}",
            )


if __name__ == "__main__":
    unittest.main()
