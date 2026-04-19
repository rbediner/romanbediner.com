import unittest
from pathlib import Path


class FaviconAssetsTest(unittest.TestCase):
    """Validate favicon assets and canonical page references."""

    @classmethod
    def setUpClass(cls):
        # QA/tests is nested one level under the repository root.
        cls.root = Path(__file__).resolve().parents[2]
        cls.expected_assets = [
            cls.root / "assets/favicon/favicon-16x16.png",
            cls.root / "assets/favicon/favicon-32x32.png",
            cls.root / "assets/favicon/apple-touch-icon.png",
            cls.root / "assets/favicon/favicon.ico",
        ]
        cls.page_checks = [
            ("index.html", "assets/favicon/"),
            ("about/index.html", "../assets/favicon/"),
            ("services/index.html", "../assets/favicon/"),
            ("connect/index.html", "../assets/favicon/"),
            ("framework/index.html", "../assets/favicon/"),
            ("resources/index.html", "../assets/favicon/"),
            ("resources/ai-enabled-operations-framework-summary/index.html", "../../assets/favicon/"),
        ]

    def test_favicon_assets_exist(self):
        for asset in self.expected_assets:
            self.assertTrue(asset.exists(), f"Missing favicon asset: {asset}")

    def test_pages_reference_favicon_set(self):
        for rel_page, base in self.page_checks:
            html = (self.root / rel_page).read_text(encoding="utf-8")
            self.assertIn(f'href="{base}favicon-32x32.png"', html)
            self.assertIn(f'href="{base}favicon-16x16.png"', html)
            self.assertIn(f'href="{base}apple-touch-icon.png"', html)
            self.assertIn(f'href="{base}favicon.ico"', html)


if __name__ == "__main__":
    unittest.main()
