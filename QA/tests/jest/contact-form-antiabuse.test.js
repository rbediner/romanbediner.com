/**
 * Invariant:
 * - Contact form anti-abuse guard logic must reject abusive payloads and allow valid submissions.
 * Why this exists:
 * - Static EmailJS forms need client-side guardrails to reduce spam and quota abuse.
 * What breaks if it fails:
 * - Bots can drain EmailJS quota, flood inboxes, and degrade contact reliability.
 */
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const contactModule = require(path.join(root, 'scripts', 'contact-form-emailjs.js'));

describe('Contact form anti-abuse guards', () => {
  const baseNow = 1_800_000_000_000;

  const validPayload = () => ({
    now: baseNow,
    pageLoadAt: baseNow - 10_000,
    history: [],
    honeypotValue: '',
    email: 'operator@enterprise.com',
    messageText: 'Hello Roman, I would like to discuss operating model design for our team.'
  });

  test('valid form submission passes guard checks', () => {
    const result = contactModule.evaluateSubmissionGuards(validPayload());
    expect(result).toEqual({ ok: true, reason: 'ok' });
  });

  test('honeypot triggered is rejected', () => {
    const payload = validPayload();
    payload.honeypotValue = 'bot filled this';

    const result = contactModule.evaluateSubmissionGuards(payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('honeypot');
  });

  test('submission too fast after page load is rejected', () => {
    const payload = validPayload();
    payload.pageLoadAt = payload.now - 1500;

    const result = contactModule.evaluateSubmissionGuards(payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('too_fast');
  });

  test('cooldown violation is rejected', () => {
    const payload = validPayload();
    payload.history = [payload.now - 4000];

    const result = contactModule.evaluateSubmissionGuards(payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('cooldown');
  });

  test('hourly/day rate limits are rejected', () => {
    const hourlyPayload = validPayload();
    hourlyPayload.history = [
      hourlyPayload.now - 20_000,
      hourlyPayload.now - 25_000,
      hourlyPayload.now - 30_000,
      hourlyPayload.now - 35_000,
      hourlyPayload.now - 40_000
    ];

    const hourlyResult = contactModule.evaluateSubmissionGuards(hourlyPayload);
    expect(hourlyResult.ok).toBe(false);
    expect(hourlyResult.reason).toBe('hour_limit');

    const dailyPayload = validPayload();
    dailyPayload.history = Array.from({ length: contactModule.MAX_SUBMISSIONS_PER_DAY }, (_item, idx) => {
      return dailyPayload.now - (idx + 1) * (55 * 60 * 1000);
    });

    const dailyResult = contactModule.evaluateSubmissionGuards(dailyPayload);
    expect(dailyResult.ok).toBe(false);
    expect(dailyResult.reason).toBe('day_limit');
  });

  test('spam pattern messages are rejected', () => {
    const tooShort = validPayload();
    tooShort.messageText = 'hello';
    expect(contactModule.evaluateSubmissionGuards(tooShort).reason).toBe('short_message');

    const tooManyUrls = validPayload();
    tooManyUrls.messageText = 'Visit https://a.com https://b.com https://c.com for guaranteed profit';
    expect(contactModule.evaluateSubmissionGuards(tooManyUrls).reason).toBe('too_many_urls');

    const repeatedChars = validPayload();
    repeatedChars.messageText = 'Helloooooooooooo this is suspicious content with long repeats';
    expect(contactModule.evaluateSubmissionGuards(repeatedChars).reason).toBe('repeated_chars');

    const keywordSpam = validPayload();
    keywordSpam.messageText = 'I can provide guaranteed profit with a crypto investment package.';
    expect(contactModule.evaluateSubmissionGuards(keywordSpam).reason).toBe('keyword');
  });

  test('disposable email domains are rejected', () => {
    const payload = validPayload();
    payload.email = 'throwaway@mailinator.com';

    const result = contactModule.evaluateSubmissionGuards(payload);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('disposable_domain');
  });
});
