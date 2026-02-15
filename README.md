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
Utility scripts used by development checks.
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

- Contact form lives in `contact.html`.
- Uses:
  - Quill (`cdn.quilljs.com`)
  - EmailJS browser SDK (`cdn.jsdelivr.net`)
- EmailJS IDs are hardcoded in page script:
  - `SERVICE_ID`
  - `TEMPLATE_ID`
  - `PUBLIC_KEY`
- Recipient email is intentionally obfuscated in JS and not exposed in HTML markup.
- Anti-spam protections:
  - Hidden honeypot field (`company`)
  - Client-side rate limit (`contact_last_submit`, 60s)
  - Minimum message length validation

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

## Maintenance Notes

- Keep root page filenames as-is (`index.html`, `about.html`, `services.html`, `contact.html`) to preserve clean production URLs.
- If additional URL aliases are needed, use redirect stubs like `home/index.html` and point canonical tags to the true source page.
- If EmailJS credentials change, update only the constants in `contact.html`.
