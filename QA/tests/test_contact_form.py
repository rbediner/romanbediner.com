import re
import unittest
from pathlib import Path


# QA/tests is nested one level under the repository root.
ROOT = Path(__file__).resolve().parents[2]
CONTACT_HTML = ROOT / "connect" / "index.html"
CONTACT_JS = ROOT / "scripts" / "contact-form-emailjs.js"


class ContactPageQATest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = CONTACT_HTML.read_text(encoding="utf-8")
        cls.js = CONTACT_JS.read_text(encoding="utf-8")

    def test_has_expected_hero_and_icon(self):
        self.assertIn('src="../assets/icons/contact.png"', self.html)
        self.assertIn("<h1>Let's start a conversation.</h1>", self.html)
        self.assertIn("Share what you're working on or just reach out to connect.", self.html)

    def test_has_accessible_form_fields(self):
        self.assertRegex(
            self.html,
            r'<input id="name" name="name" type="text" required aria-required="true" ?/>',
        )
        self.assertRegex(
            self.html,
            r'<input id="email" name="email" type="email" required aria-required="true" ?/>',
        )
        self.assertIn('<input id="company" name="company" type="text" autocomplete="off"/>', self.html)
        self.assertIn('<label for="message-editor">Message</label>', self.html)
        self.assertIn('<div id="message-editor" aria-required="true"></div>', self.html)
        self.assertNotIn('id="subject"', self.html)

    def test_has_quill_and_character_limit(self):
        self.assertIn("https://cdn.quilljs.com/1.3.6/quill.min.js", self.html)
        self.assertNotIn("char-count", self.html)
        self.assertIn("const MAX_MESSAGE_CHARS = 10000;", self.js)
        self.assertIn('["bold", "italic"]', self.js)
        self.assertIn('[{ list: "bullet" }]', self.js)

    def test_uses_emailjs_not_mailto(self):
        self.assertIn("https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js", self.html)
        self.assertRegex(self.js, r'const SERVICE_ID = "service_[A-Za-z0-9]+";')
        self.assertRegex(self.js, r'const TEMPLATE_ID = "template_[A-Za-z0-9]+";')
        self.assertRegex(self.js, r'const PUBLIC_KEY = "[A-Za-z0-9_-]+";')
        self.assertIn("await emailjs.send(SERVICE_ID, TEMPLATE_ID", self.js)
        self.assertIn("to_email: recipient,", self.js)
        self.assertIn("to: recipient,", self.js)
        self.assertIn("recipient_email: recipient,", self.js)
        self.assertIn("recipient: recipient,", self.js)
        self.assertIn('subject: "Website contact"', self.js)
        self.assertNotIn("mailto:", self.html)

    def test_submit_button_and_feedback_states(self):
        self.assertIn('id="submit-btn" type="submit">Send message</button>', self.html)
        self.assertIn('submitBtn.textContent = "Sending...";', self.js)
        self.assertIn(
            "Thank you for reaching out. I will review your message and respond shortly.",
            self.js,
        )
        self.assertIn('id="form-error" role="status" aria-live="polite"', self.html)
        self.assertIn('Please provide a bit more detail.', self.js)
        self.assertIn("Please wait before sending another message.", self.js)

    def test_hides_direct_recipient_address(self):
        self.assertNotIn("rbediner+website@gmail.com", self.html)
        self.assertNotIn("connect@romanbediner.com", self.html)
        self.assertRegex(self.js, r"const recipient = \[\s*99,\s*111,\s*110,\s*110,\s*101,\s*99,\s*116,\s*64")

    def test_linkedin_uses_executive_action_block(self):
        self.assertIn('class="executive-action-block"', self.html)
        self.assertIn('href="https://www.linkedin.com/in/romanbediner"', self.html)
        self.assertIn("Connect on LinkedIn", self.html)
        self.assertIn("For executive search, advisory opportunities, and professional networking.", self.html)

    def test_externalized_css_and_layout_hooks_exist(self):
        self.assertIn('<link rel="stylesheet" href="/styles/connect.css" />', self.html)
        self.assertIn('<link rel="stylesheet" href="/styles/site.css" />', self.html)
        self.assertIn('<script src="../scripts/site-navigation.js"></script>', self.html)
        self.assertIn('<script src="../scripts/contact-form-emailjs.js"></script>', self.html)
        self.assertIn("contact_draft", self.js)


if __name__ == "__main__":
    unittest.main()
