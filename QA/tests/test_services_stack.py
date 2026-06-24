import unittest
from pathlib import Path


class ServicesStackTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[2]
        cls.services_html = (cls.root / "services/index.html").read_text(encoding="utf-8")
        cls.services_css = (cls.root / "styles/services.css").read_text(encoding="utf-8")

    def test_four_service_entries_exist(self):
        self.assertEqual(self.services_html.count('<div class="svc-entry">'), 4)
        self.assertNotIn('Execution Leadership Coaching', self.services_html)
        self.assertNotIn('Productizing Operations for Modern AI-Enabled Work', self.services_html)

    def test_new_headings_exist(self):
        for phrase in [
            'AI-ENABLED OPERATING SYSTEMS',
            'EXECUTIVE OPERATING LEADERSHIP',
            'FRACTIONAL AND EMBEDDED OPERATING LEADERSHIP',
            'STRATEGIC PROGRAM AND TRANSFORMATION LEADERSHIP',
            'OPERATOR DEVELOPMENT AND AI ENABLEMENT',
            'APPLYING THE WORK',
        ]:
            self.assertIn(phrase, self.services_html)

    def test_navigation_targets_exist(self):
        self.assertIn('href="/framework/"', self.services_html)
        self.assertIn('href="/connect/"', self.services_html)

    def test_css_keeps_numbered_layout(self):
        self.assertIn('.svc-entry', self.services_css)
        self.assertIn('.svc-num', self.services_css)
        self.assertIn('.svc-icon', self.services_css)


if __name__ == "__main__":
    unittest.main()
