# Selective QA Gate Review

- Date: 2026-03-30
- Audience: operator review / next-machine Codex kickoff
- Scope: replace blunt `fast/full` QA routing with five selective gates plus production smoke validation

## Why We Are Doing This

Today we still spend too much time paying for full regression on changes that do not justify it. The goal of this rollout is to keep quality high while stopping obvious waste.

Observed baseline from today:

- A broad release-quality path can still take well over 30 minutes end to end once local parity, staging CI, preview review, and prod promotion are counted together.
- The most expensive parts are browser/visual/Playwright work, Python QA, and replaying release-quality validation more than once.

Best-practice principle:

- Run the smallest responsible gate on `staging`.
- Promote the exact tested SHA to `prod`.
- Always run a short production smoke test after deploy.
- Fall back to `full-regression` when risk is broad or ambiguous.

## The Five Gates

| Gate | When it should run | What it runs | What it intentionally skips | GA coverage |
| --- | --- | --- | --- | --- |
| `docs-only` | `README.md`, `docs/**`, `AGENTS.md` only | `docs:verify`, `test:node`, `test:jest` | Browser, links, Lighthouse, artifact build, Python QA | Covered indirectly through static contract tests only |
| `localized-page` | One route scope only (`home`, `about`, `services`, `framework`, `connect`) | `test:node`, `test:jest`, `test:links` | Full browser suite, Python QA, Lighthouse, artifact build | Static GA contract remains covered by `test:node` |
| `shared-ui` | Shared CSS, shared nav, shared runtime JS, multi-route shell/layout changes | `test:node`, `test:jest`, `test:links`, `test:playwright -- --workers=3`, `test:lighthouse` | Python QA, artifact build | GA static + runtime coverage |
| `release-infra` | Workflows, release scripts, build scripts, repo contract, architecture control files | `verify:repo-contract`, `verify:workflow-integrity`, `test:node`, `test:jest`, artifact build + integrity verify | Page/browser regressions unless the change also touches product UI | GA contract stays in scope because deploy/build changes can strip analytics |
| `full-regression` | Broad, mixed, unknown, or cross-cutting changes | `qa:ci-parity` | Nothing | Full GA coverage |

## Production Smoke Test

Production smoke is not a replacement for staging QA. It is a post-deploy sanity gate that proves the live site is still healthy after release.

Command:

```bash
npm run qa:smoke:prod
```

It checks:

1. homepage returns `200`
2. sitemap returns `200`
3. every route in live `sitemap.xml` returns `200`
4. homepage still contains:
   - JSON-LD structured data
   - CSP
   - GA bootstrap reference

Best practice:

- Keep production smoke small, reliable, and fast.
- Never use prod smoke as an excuse to weaken staging validation.

## Gate Classifier Logic

Implemented in:

- `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/resolve-gate-profile.js`

Local runner:

- `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/scripts/qa/run-selective-gate.js`

Current route scopes:

- `home`
- `about`
- `services`
- `framework`
- `connect`

Classifier rules in plain English:

1. docs only -> `docs-only`
2. one route only -> `localized-page`
3. shared shell or multiple routes -> `shared-ui`
4. workflow/release/build-only -> `release-infra`
5. unknown or mixed risk -> `full-regression`

## How We Measure Savings

Selective local gate runs now write metrics to:

- `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Codex/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`

That file records:

- selected gate
- reason
- changed files
- route scopes
- total duration
- per-command durations

This is the first measurement layer. It gives us hard numbers for local runs instead of guessing.

## Practical Efficiency Model

These are current planning estimates, not final performance guarantees:

| Gate | Expected local cost vs full regression | Why |
| --- | --- | --- |
| `docs-only` | 85% to 95% cheaper | No browser, no Lighthouse, no Python, no artifact build |
| `localized-page` | 70% to 85% cheaper | Keeps static checks and links, skips browser/QA/lighthouse |
| `shared-ui` | 40% to 65% cheaper | Adds browser + Lighthouse, still skips Python QA and artifact build |
| `release-infra` | 60% to 80% cheaper | Tests release logic directly instead of replaying site-wide browser QA |
| `full-regression` | No intended savings | This is the safety fallback |

Production smoke adds a small post-deploy cost, but it is far cheaper than rerunning full staging-style validation after promotion.

## Example Scenarios

### Scenario A — README update only

Expected gate:

- `docs-only`

Why:

- no product/runtime files changed

### Scenario B — homepage portrait swap

Expected gate:

- `localized-page`

Why:

- one route scope (`home`) changed

### Scenario C — shared nav/runtime change

Expected gate:

- `shared-ui`

Why:

- change affects multiple pages through shared runtime

### Scenario D — deploy workflow change

Expected gate:

- `release-infra`

Why:

- operator/release risk changed, not page UI

### Scenario E — mixed workflow + homepage layout change

Expected gate:

- `full-regression`

Why:

- release + product risk mixed together

## Tomorrow Review Checklist

Please review these questions:

1. Do the five gates feel intuitive enough to trust without constant manual overrides?
2. Is the production smoke scope the right size, or do you want one or two more checks added?
3. Do you want `localized-page` to include a one-page Playwright check by default, or keep it cheaper as currently designed?
4. Should `release-infra` include preview live validation by default, or only when staging preview logic itself changes?
5. Does the savings model feel aligned with your goal of “way more efficient without getting sloppy”?

## Recommended Next Step After Review

If the gate matrix looks right tomorrow, the next good move is:

1. run one real `localized-page` release
2. capture the metrics JSON
3. compare it directly against a full-regression run
4. document the observed delta in minutes, not just percentages

That will give us the first real before/after proof.
