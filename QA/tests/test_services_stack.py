import unittest
from pathlib import Path
import re


class ServicesStackTest(unittest.TestCase):
    """Validate the Services page stack layout, headings, and card count."""

    @classmethod
    def setUpClass(cls):
        # Resolve repository root from QA/tests.
        cls.root = Path(__file__).resolve().parents[2]
        cls.services_html = (cls.root / "services/index.html").read_text(encoding="utf-8")
        cls.services_css = (cls.root / "styles/services.css").read_text(encoding="utf-8")

    def test_service_stack_structure_present(self):
        """Ensure services use a stack container with five restored cards."""
        self.assertIn('class="service-stack"', self.services_html)
        self.assertEqual(self.services_html.count('<div class="service-stack">'), 1)
        # Count cards inside the stack container to avoid counting unrelated markup.
        match = re.search(r'<div class="service-stack">(.*?)</div>\s*</main>', self.services_html, re.S)
        self.assertIsNotNone(match)
        stack_html = match.group(1)
        self.assertEqual(stack_html.count('<div class="service-card">'), 5)

    def test_executive_callout_and_headings_present(self):
        """Ensure executive callout and restored service headings are rendered."""
        self.assertIn('class="executive-callout"', self.services_html)
        self.assertIn('Services &amp; Expertise', self.services_html)
        self.assertIn('Strategic Operating Architecture', self.services_html)
        self.assertIn('Execution &amp; Scalable Delivery', self.services_html)
        self.assertIn('Embedded Operating Leadership', self.services_html)
        self.assertIn('AI-Enabled Operating Systems', self.services_html)
        self.assertIn('Performance Instrumentation', self.services_html)

    def test_stack_css_rules_present(self):
        """Ensure stack, hover, and icon rules exist in the services stylesheet."""
        self.assertIn('.service-stack', self.services_css)
        self.assertIn('.service-header-row', self.services_css)
        self.assertIn('.executive-callout', self.services_css)
        self.assertIn('.service-card:hover', self.services_css)
        self.assertIn('.service-icon', self.services_css)


if __name__ == "__main__":
    unittest.main()
