/*
 * Purpose:
 * - Manage Connect page form runtime behavior including validation, editor state, anti-abuse checks, and EmailJS submission flow.
 *
 * Architectural role:
 * - Provides the client-side submission orchestration for a static deployment with no backend form processor.
 *
 * Dependencies:
 * - Browser DOM APIs, Quill, and EmailJS runtime libraries loaded by the Connect page.
 *
 * Security/CSP considerations:
 * - Avoids inline handlers and keeps execution in an external script to remain CSP-compatible.
 * - Applies deterministic anti-abuse gates (honeypot, timing, throttling, spam heuristics) before EmailJS calls.
 *
 * Migration considerations:
 * - If form providers or CSP allowlists change, update loader origins and rerun QA runtime tests.
 */
// Contact page form behavior:
// - Quill editor initialization
// - Draft autosave
// - Anti-abuse gate checks
// - EmailJS send
(function contactFormModule(root) {
  const SERVICE_ID = "service_gdy8zrq";
  const TEMPLATE_ID = "template_ochbn5j";
  const PUBLIC_KEY = "UfPL6R5QTMSffMppT";
  const MAX_MESSAGE_CHARS = 10000;

  const ANTI_ABUSE_MESSAGE = "Your message could not be submitted right now. Please try again later.";
  const MIN_SUBMIT_AGE_MS = 4000;
  const COOLDOWN_MS = 15000;
  const HOUR_MS = 60 * 60 * 1000;
  const DAY_MS = 24 * HOUR_MS;
  const MAX_SUBMISSIONS_PER_HOUR = 5;
  const MAX_SUBMISSIONS_PER_DAY = 25;
  const SUBMISSION_HISTORY_KEY = "contact_submit_history_v1";

  const BLOCKED_EMAIL_DOMAINS = [
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "guerrillamail.com",
    "yopmail.com",
    "trashmail.com"
  ];

  const SPAM_KEYWORDS = [
    "viagra",
    "crypto investment",
    "bitcoin investment",
    "guaranteed profit",
    "seo services",
    "casino"
  ];

  const recipient = [
    99, 111, 110, 110, 101, 99, 116, 64, 114, 111, 109, 97, 110, 98, 101, 100,
    105, 110, 101, 114, 46, 99, 111, 109
  ].map((c) => String.fromCharCode(c)).join("");

  function normalizeEmailDomain(email) {
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return "";
    }
    return email.split("@").pop().trim().toLowerCase();
  }

  function isDisposableEmailDomain(email) {
    const domain = normalizeEmailDomain(email);
    if (!domain) {
      return true;
    }
    return BLOCKED_EMAIL_DOMAINS.includes(domain);
  }

  function countUrls(message) {
    if (!message) {
      return 0;
    }
    const match = message.match(/(https?:\/\/\S+|www\.\S+)/gi);
    return match ? match.length : 0;
  }

  function hasRepeatedCharacters(message) {
    if (!message) {
      return false;
    }
    return /(.)\1{7,}/i.test(message);
  }

  function hasSpamKeyword(message) {
    if (!message) {
      return false;
    }
    const text = message.toLowerCase();
    return SPAM_KEYWORDS.some((keyword) => text.includes(keyword));
  }

  function readSubmissionHistory(storage) {
    try {
      const raw = storage.getItem(SUBMISSION_HISTORY_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((value) => Number.isFinite(value));
    } catch (_error) {
      return [];
    }
  }

  function pruneSubmissionHistory(history, now) {
    const cutoff = now - DAY_MS;
    return history.filter((timestamp) => timestamp >= cutoff);
  }

  function writeSubmissionHistory(storage, history) {
    storage.setItem(SUBMISSION_HISTORY_KEY, JSON.stringify(history));
  }

  function recordSubmission(storage, now) {
    const history = pruneSubmissionHistory(readSubmissionHistory(storage), now);
    history.push(now);
    writeSubmissionHistory(storage, history);
  }

  function evaluateSubmissionGuards(payload) {
    const {
      now,
      pageLoadAt,
      history,
      honeypotValue,
      email,
      messageText
    } = payload;

    if (typeof honeypotValue === "string" && honeypotValue.trim() !== "") {
      return { ok: false, reason: "honeypot" };
    }

    if (now - pageLoadAt < MIN_SUBMIT_AGE_MS) {
      return { ok: false, reason: "too_fast" };
    }

    const normalized = pruneSubmissionHistory(history, now);
    const lastSubmission = normalized.length ? normalized[normalized.length - 1] : null;
    if (Number.isFinite(lastSubmission) && now - lastSubmission < COOLDOWN_MS) {
      return { ok: false, reason: "cooldown" };
    }

    const submissionsLastHour = normalized.filter((stamp) => now - stamp <= HOUR_MS).length;
    if (submissionsLastHour >= MAX_SUBMISSIONS_PER_HOUR) {
      return { ok: false, reason: "hour_limit" };
    }

    if (normalized.length >= MAX_SUBMISSIONS_PER_DAY) {
      return { ok: false, reason: "day_limit" };
    }

    const trimmedMessage = (messageText || "").trim();
    if (trimmedMessage.length < 10) {
      return { ok: false, reason: "short_message" };
    }

    if (trimmedMessage.length > MAX_MESSAGE_CHARS) {
      return { ok: false, reason: "long_message" };
    }

    if (countUrls(trimmedMessage) > 2) {
      return { ok: false, reason: "too_many_urls" };
    }

    if (hasRepeatedCharacters(trimmedMessage)) {
      return { ok: false, reason: "repeated_chars" };
    }

    if (hasSpamKeyword(trimmedMessage)) {
      return { ok: false, reason: "keyword" };
    }

    if (isDisposableEmailDomain(email)) {
      return { ok: false, reason: "disposable_domain" };
    }

    return { ok: true, reason: "ok" };
  }

  function initContactForm() {
    if (typeof document === "undefined") {
      return;
    }

    const contactForm = document.getElementById("contact-form");
    const formCard = document.getElementById("form-card");
    const submitBtn = document.getElementById("submit-btn");
    const formError = document.getElementById("form-error");
    const honeypot = document.getElementById("company");

    if (
      !contactForm ||
      !formCard ||
      !submitBtn ||
      !formError ||
      !honeypot ||
      typeof Quill === "undefined" ||
      typeof emailjs === "undefined"
    ) {
      return;
    }

    const pageLoadAt = Date.now();
    const draftKey = "contact_draft";

    const quill = new Quill("#message-editor", {
      theme: "snow",
      modules: {
        toolbar: [["bold", "italic"], [{ list: "bullet" }], ["link"]]
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
    if (saved) {
      quill.root.innerHTML = saved;
    }
    quill.on("text-change", () => {
      localStorage.setItem(draftKey, quill.root.innerHTML);
    });

    const getMessageText = () => {
      const text = quill.getText();
      return text.endsWith("\n") ? text.slice(0, -1) : text;
    };

    emailjs.init({ publicKey: PUBLIC_KEY });

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      formError.textContent = "";

      if (!contactForm.reportValidity()) {
        return;
      }

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const messageText = getMessageText().trim();
      const messageHtml = quill.root.innerHTML.trim();
      const now = Date.now();
      const history = readSubmissionHistory(localStorage);

      const guardResult = evaluateSubmissionGuards({
        now,
        pageLoadAt,
        history,
        honeypotValue: honeypot.value,
        email,
        messageText
      });

      if (!guardResult.ok) {
        formError.textContent = ANTI_ABUSE_MESSAGE;
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          to_email: recipient,
          to: recipient,
          recipient_email: recipient,
          recipient: recipient,
          from_name: name,
          from_email: email,
          reply_to: email,
          subject: "Website contact",
          message: messageText,
          message_html: messageHtml
        });

        recordSubmission(localStorage, now);
        localStorage.removeItem(draftKey);
        formCard.innerHTML = '<p class="success-message">Thank you for reaching out. I will review your message and respond shortly.</p>';
      } catch (_error) {
        formError.textContent = "Something went wrong while sending. Please try again.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      }
    });
  }

  initContactForm();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      ANTI_ABUSE_MESSAGE,
      BLOCKED_EMAIL_DOMAINS,
      SPAM_KEYWORDS,
      COOLDOWN_MS,
      MAX_SUBMISSIONS_PER_HOUR,
      MAX_SUBMISSIONS_PER_DAY,
      MIN_SUBMIT_AGE_MS,
      countUrls,
      evaluateSubmissionGuards,
      hasRepeatedCharacters,
      hasSpamKeyword,
      isDisposableEmailDomain,
      normalizeEmailDomain,
      pruneSubmissionHistory,
      readSubmissionHistory,
      writeSubmissionHistory,
      recordSubmission
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
