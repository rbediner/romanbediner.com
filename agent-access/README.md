# Agent access edge worker

This Worker enables safe `Accept: text/markdown` negotiation for `romanbediner.com` while keeping GitHub Pages as the website origin. GitHub Pages cannot choose a representation from an HTTP request header, so this edge layer provides the Markdown variant and adds `Vary: Accept` to normal origin responses.

## Environments

- `staging` deploys only to a dedicated `workers.dev` URL and proxies the GitHub Pages staging preview.
- `production` defines the `romanbediner.com/*` route but must not be deployed until the exact staging worker and static-site SHA are approved. It proxies the GitHub Pages production origin, preventing recursive fetches through the Cloudflare route.

## Verification

Run the focused unit test first:

```bash
node QA/tests/test-agent-content-edge.js
```

Then validate the configuration and deploy staging:

```bash
npx wrangler deploy --config agent-access/wrangler.jsonc --env staging --dry-run
npx wrangler deploy --config agent-access/wrangler.jsonc --env staging
curl -i -H 'Accept: text/markdown' https://<staging-worker-url>/
```

The expected Markdown response includes `Content-Type: text/markdown; charset=utf-8` and `Vary: Accept, Accept-Encoding`. Do not deploy the production environment or attach its route without explicit production approval.
