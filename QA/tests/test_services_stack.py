import re
import unittest
from pathlib import Path


class ServicesStackTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[2]
        cls.services_html = (cls.root / "services/index.html").read_text(encoding="utf-8")
        cls.services_css = (cls.root / "styles/services.css").read_text(encoding="utf-8")

    def test_five_service_entries_exist(self):
        # Attribute-tolerant: each .svc-entry now also carries an id for the
        # "On this page" section nav, so match the class rather than an exact tag.
        # Service entries may carry shared contained-surface modifiers in addition to their stable hook.
        self.assertEqual(len(re.findall(r'class="[^"]*\bsvc-entry\b[^"]*"', self.services_html)), 5)
        self.assertNotIn('Execution Leadership Coaching', self.services_html)
        self.assertNotIn('Productizing Operations for Modern AI-Enabled Work', self.services_html)

    def test_new_headings_exist(self):
        # Section headings (H2) remain uppercase
        for phrase in [
            'AI-ENABLED OPERATING SYSTEMS',
            'APPLYING THE WORK',
        ]:
            self.assertIn(phrase, self.services_html)
        # svc-h3 elements were removed; svc-label carries the heading in mixed case
        for phrase in [
            'Executive Operating Leadership',
            'Fractional and Embedded Operating Leadership',
            'Strategic Program and Transformation Leadership',
            'Operator Development and AI Enablement',
        ]:
            self.assertIn(phrase, self.services_html)

    def test_navigation_targets_exist(self):
        self.assertIn('href="/framework/"', self.services_html)
        self.assertIn('href="/connect/"', self.services_html)

    def test_css_keeps_numbered_layout(self):
        self.assertIn('.svc-entry', self.services_css)
        self.assertIn('.svc-num', self.services_css)
        self.assertIn('.svc-icon', self.services_css)

    def test_service_icons_are_distinct(self):
        # Each service entry needs its own visual cue; repeated icons make
        # separate service models look like the same offering.
        import re
        icons = re.findall(r'<img src="([^"]+)" class="svc-icon"', self.services_html)
        self.assertEqual(len(icons), 5)
        self.assertEqual(len(set(icons)), 5)
        self.assertIn('fractional-embedded-operating-leadership.svg', self.services_html)


if __name__ == "__main__":
    unittest.main()
