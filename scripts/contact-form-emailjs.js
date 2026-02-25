/*
 * Purpose:
 * - contact-form-emailjs.js supports static-site runtime or QA automation behavior.
 *
 * Architectural role:
 * - Encodes shared implementation contracts used by CI and production pages.
 *
 * Dependencies:
 * - Node.js and the repository file structure for canonical routes/assets.
 *
 * Migration considerations:
 * - If hosting model or route structure changes, update path assumptions and re-run QA.
 */
// Contact page form behavior:
// - Quill editor initialization
// - Honeypot + validation + rate limiting
// - Draft autosave
// - EmailJS send
(function initContactForm() {
  const SERVICE_ID = "service_gdy8zrq";
  const TEMPLATE_ID = "template_ochbn5j";
  const PUBLIC_KEY = "UfPL6R5QTMSffMppT";
  const MAX_MESSAGE_CHARS = 10000;
  const RATE_LIMIT_KEY = "contact_last_submit";
  const RATE_LIMIT_MS = 60000;
  const draftKey = "contact_draft";

  const recipient = [
    114, 98, 101, 100, 105, 110, 101, 114, 43, 119, 101, 98, 115, 105, 116, 101,
    64, 103, 109, 97, 105, 108, 46, 99, 111, 109
  ].map((c) => String.fromCharCode(c)).join("");

  const contactForm = document.getElementById("contact-form");
  const formCard = document.getElementById("form-card");
  const submitBtn = document.getElementById("submit-btn");
  const formError = document.getElementById("form-error");
  if (!contactForm || !formCard || !submitBtn || !formError || typeof Quill === "undefined" || typeof emailjs === "undefined") {
    return;
  }

  const quill = new Quill("#message-editor", {
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic"],
        [{ list: "bullet" }],
        ["link"]
      ]
    }
  });

  const editor = document.querySelector(".ql-editor");
  if (editor) {
    editor.style.resize = "vertical";
    editor.style.minHeight = "220px";
    editor.style.maxHeight = "600px";
    editor.style.overflow = "auto";
  }

  const saved = localStorage.getItem(draftKey);
  if (saved) quill.root.innerHTML = saved;
  quill.on("text-change", () => localStorage.setItem(draftKey, quill.root.innerHTML));

  const getMessageText = () => {
    const text = quill.getText();
    return text.endsWith("\n") ? text.slice(0, -1) : text;
  };

  emailjs.init({ publicKey: PUBLIC_KEY });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.textContent = "";

    if (document.getElementById("company").value.trim() !== "") return;

    if (!contactForm.reportValidity()) return;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const messageText = getMessageText().trim();
    const messageHtml = quill.root.innerHTML.trim();

    if (!messageText) {
      formError.textContent = "Please enter a message.";
      return;
    }

    if (messageText.length < 10) {
      formError.textContent = "Please provide a bit more detail.";
      return;
    }

    if (messageText.length > MAX_MESSAGE_CHARS) {
      formError.textContent = "Message is too long.";
      return;
    }

    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit && Date.now() - Number(lastSubmit) < RATE_LIMIT_MS) {
      formError.textContent = "Please wait before sending another message.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: recipient,
        from_name: name,
        from_email: email,
        reply_to: email,
        subject: "Website contact",
        message: messageText,
        message_html: messageHtml
      });

      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      localStorage.removeItem(draftKey);
      formCard.innerHTML = "<p class=\"success-message\">Thank you for reaching out. I will review your message and respond shortly.</p>";
    } catch (error) {
      formError.textContent = "Something went wrong while sending. Please try again.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
})();
