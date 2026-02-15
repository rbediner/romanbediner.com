# romanbediner.com

Static website hosted on GitHub Pages for:
`https://rbediner.github.io/romanbediner.com/`

## Structure

- `index.html`:
Canonical homepage source.
- `about.html`:
About page.
- `services.html`:
Services page.
- `contact.html`:
Contact page with EmailJS + Quill integration.
- `assets/`:
Images, icons, logos, OG image.
- `scripts/`:
All browser JS lives here (no root-level `.js` files), plus small dev check scripts.
- `tests/`:
Python `unittest` checks for contact page structure and behavior wiring.
- `home/index.html`:
Alias URL handler so `/home` works while canonical stays on `/index.html`.

## URL Policy

- Canonical page URLs:
  - `https://rbediner.github.io/romanbediner.com/index.html`
  - `https://rbediner.github.io/romanbediner.com/about.html`
  - `https://rbediner.github.io/romanbediner.com/services.html`
  - `https://rbediner.github.io/romanbediner.com/contact.html`
- `/home` support:
  - `home/index.html` redirects to `../index.html`.
  - It is marked `noindex,follow` to avoid duplicate homepage indexing.

## Contact Form Notes

- Contact form markup lives in `contact.html`.
- Uses:
  - Quill (`cdn.quilljs.com`)
  - EmailJS browser SDK (`cdn.jsdelivr.net`)
- Contact form logic is in `scripts/contact-form-emailjs.js`.
- Email service provider: **EmailJS**.
- Current EmailJS config values (stored in `scripts/contact-form-emailjs.js`):
  - `SERVICE_ID = service_gdy8zrq`
  - `TEMPLATE_ID = template_ochbn5j`
  - `PUBLIC_KEY = UfPL6R5QTMSffMppT`
- EmailJS send payload currently includes:
  - `to_email`
  - `from_name`
  - `from_email`
  - `reply_to`
  - `subject` (hardcoded to `Website contact`)
  - `message`
  - `message_html`
- Recipient email is intentionally obfuscated in JS and not exposed in HTML markup.
- Anti-spam protections:
  - Hidden honeypot field (`company`)
  - Client-side rate limit (`contact_last_submit`, 60s)
  - Minimum message length validation
  - Draft autosave key (`contact_draft`)

## Social / Asset Caveat

- LinkedIn icon path used by contact page:
  - `assets/icons/LinkedIn.png`
- Contact hero icon path:
  - `assets/icons/contact.png`

## SEO / Social Preview

- Each primary page includes:
  - `canonical` link tag
  - OG image metadata
  - Twitter image metadata
- OG image source of truth:
  - `assets/og-logo/og.png`

## Local Checks

Run tests:

```bash
python3 -m unittest discover -s tests -v
```

Validate OG metadata references:

```bash
bash scripts/check_og_urls.sh
```

## Script Inventory

- `scripts/site-navigation.js`:
Shared header/mobile navigation behavior used by all primary pages.
- `scripts/contact-form-emailjs.js`:
Contact page behavior: Quill editor init, honeypot/rate-limit validation, draft autosave, and EmailJS send flow.
- `scripts/check_og_urls.sh`:
Dev check to validate OG/Twitter image metadata references.

## Maintenance Notes

- Keep root page filenames as-is (`index.html`, `about.html`, `services.html`, `contact.html`) to preserve clean production URLs.
- If additional URL aliases are needed, use redirect stubs like `home/index.html` and point canonical tags to the true source page.
- If EmailJS credentials change, update constants in `scripts/contact-form-emailjs.js`.
