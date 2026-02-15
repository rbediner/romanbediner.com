import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTACT_HTML = ROOT / "Pages" / "contact.html"
CONTACT_JS = ROOT / "scripts" / "contact-form-emailjs.js"


class ContactPageQATest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = CONTACT_HTML.read_text(encoding="utf-8")
        cls.contact_js = CONTACT_JS.read_text(encoding="utf-8")

    def test_has_expected_hero_and_icon(self):
        self.assertIn('src="../assets/icons/contact.png"', self.html)
        self.assertIn("<h1>Let's start a conversation.</h1>", self.html)

    def test_has_accessible_form_fields(self):
        self.assertRegex(
            self.html,
            r'<input id="name" name="name" type="text" required aria-required="true" ?/>',
        )
        self.assertRegex(
            self.html,
            r'<input id="email" name="email" type="email" required aria-required="true" ?/>',
        )
        self.assertIn('<input id="company" name="company" type="text" autocomplete="off" />', self.html)
        self.assertIn('<label for="message-editor">Message</label>', self.html)
        self.assertIn('<div id="message-editor" aria-required="true"></div>', self.html)

    def test_has_quill_and_character_limit(self):
        self.assertIn("https://cdn.quilljs.com/1.3.6/quill.min.js", self.html)
        self.assertIn("const MAX_MESSAGE_CHARS = 10000;", self.contact_js)
        self.assertNotIn("char-count", self.html)

    def test_uses_emailjs_not_mailto(self):
        self.assertIn("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js", self.html)
        self.assertRegex(self.contact_js, r'const SERVICE_ID = "service_[A-Za-z0-9]+";')
        self.assertRegex(self.contact_js, r'const TEMPLATE_ID = "template_[A-Za-z0-9]+";')
        self.assertRegex(self.contact_js, r'const PUBLIC_KEY = "[A-Za-z0-9_-]+";')
        self.assertIn("await emailjs.send(SERVICE_ID, TEMPLATE_ID", self.contact_js)
        self.assertNotIn("mailto:", self.html)

    def test_submit_button_and_feedback_states(self):
        self.assertIn('id="submit-btn" type="submit">Send message</button>', self.html)
        self.assertIn('submitBtn.textContent = "Sending...";', self.contact_js)
        self.assertIn(
            "Thanks for reaching out. I'll review your message and respond directly.",
            self.contact_js,
        )
        self.assertIn('id="form-error" role="status" aria-live="polite"', self.html)

    def test_hides_direct_gmail_address(self):
        self.assertNotIn("rbediner+website@gmail.com", self.html)
        self.assertRegex(self.contact_js, r"const recipient = \[\s*114, 98, 101, 100")

    def test_linkedin_section_uses_asset_icon(self):
        self.assertIn('href="https://linkedin.com/in/romanbediner"', self.html)
        self.assertIn('src="../assets/icons/LinkedIn.png"', self.html)
        self.assertIn("Connect with me on LinkedIn", self.html)

    def test_references_external_scripts(self):
        self.assertIn('<script src="../scripts/site-navigation.js"></script>', self.html)
        self.assertIn('<script src="../scripts/contact-form-emailjs.js"></script>', self.html)
        self.assertNotIn('id="subject"', self.html)
        self.assertNotIn("const menuToggle", self.html)

    def test_mobile_and_layout_hooks_exist(self):
        self.assertIn("font-size: clamp(32px, 5vw, 40px);", self.html)
        self.assertRegex(self.html, r"\.form-wrap\s*{\s*max-width: 720px;")
        self.assertRegex(self.html, r"\.form-card\s*{\s*background: var\(--surface-color\);")
        self.assertRegex(self.html, r"@media \(min-width: 768px\)")
        self.assertIn(".form-card {\n      background: var(--surface-color);", self.html)


if __name__ == "__main__":
    unittest.main()
