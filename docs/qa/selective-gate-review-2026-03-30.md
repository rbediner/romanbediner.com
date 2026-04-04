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

## The Five Gates (v1.1)

| Gate | When it should run | What it runs | What it intentionally skips | GA coverage |
| --- | --- | --- | --- | --- |
| `docs-only` | `README.md`, `docs/**`, `AGENTS.md` only | `docs:verify` + dedicated README/handoff/SOP Jest suite (`test:docs-gate`) | Browser, links, Lighthouse, artifact build, Python QA | Covered indirectly through documentation contract tests only |
| `localized-page` | One route scope only (`home`, `about`, `services`, `framework`, `connect`) | route-owned static contract suite (`run-static-contract-suite.js` for Node + Jest), `test:links`, targeted browser smoke for the affected route | Python QA, Lighthouse, artifact build, full visual regression | Static GA contract + targeted browser/runtime GA bootstrap validation |
| `shared-ui` | Shared CSS, shared nav, shared runtime JS, multi-route shell/layout changes | shared UI static contract suite (`run-static-contract-suite.js` for Node + Jest), `test:links`, browser smoke across all canonical routes, `test:lighthouse` | Python QA, artifact build | GA static + runtime coverage |
| `release-infra` | Workflows, release scripts, build scripts, repo contract, architecture control files | `verify:repo-contract`, `verify:workflow-integrity`, release/documentation static contract suite (`run-static-contract-suite.js` for Node + Jest), artifact build + integrity verify | Page/browser regressions unless the change also touches product UI | GA contract stays in scope because deploy/build changes can strip analytics |
| `full-regression` | Broad, mixed, unknown, or cross-cutting changes | `qa:ci-parity` | Nothing | Full GA coverage |

### Why this changed from v1

The first draft was still too weak in the places we actually worry about:

- navigation drift
- broken links
- mobile layout damage
- JS interaction regressions
- GA event/bootstrap regressions
- subtle visual contract breakage such as:
  - headers drifting off the body column
  - icons losing alignment against text
  - orb bullets changing size or spacing
  - framework stage pills or moving elements breaking behavior

So `localized-page` is no longer “static checks only.” It now gets a cheap but real browser pass.

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
5. lightweight live browser smoke on:
   - `home`
   - `framework`
   - `connect`
6. live browser smoke currently verifies:
   - shared nav is rendered correctly
   - mobile nav opens and closes
   - mobile overflow is not obvious
   - homepage hero alignment contract still holds
   - framework stage pills still interact correctly
   - connect form shell still renders
   - GA bootstrap initializes in runtime

Best practice:

- Keep production smoke small, reliable, and fast.
- Never use prod smoke as an excuse to weaken staging validation.

## Gate Classifier Logic

Implemented in:

- `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/resolve-gate-profile.js`

Local runner:

- `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/scripts/qa/run-selective-gate.js`

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

## What We Are Explicitly Protecting

The gate design now assumes these risks matter every release:

### Navigation and links

- header nav labels/hrefs
- mobile nav labels/hrefs
- active-link state
- route reachability

### Mobile integrity

- menu toggle visibility
- desktop nav hidden on mobile
- mobile nav open/close
- no obvious horizontal overflow

### Visual contracts

- homepage hero alignment
- body-column/header alignment contracts enforced by static tests
- orb bullet size and spacing
- icon/text alignment contracts enforced through CSS + browser smoke

### JavaScript hotspots

- framework stage-diagram pill navigation
- shared site-navigation runtime
- connect form shell rendering

### Google Analytics

- measurement meta remains present
- bootstrap script remains present
- runtime object initializes in browser smoke

## How We Measure Savings

Selective local gate runs now write metrics to:

- `/Users/roman.bediner/Library/CloudStorage/GoogleDrive-rbediner@gmail.com/My Drive/AI/Projects/RB Website/romanbediner.com/QA/results/gate-metrics/latest-local-gate.json`

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
| `localized-page` | 55% to 75% cheaper | Adds targeted browser + mobile coverage, still avoids Python QA, Lighthouse, and full regression |
| `shared-ui` | 35% to 60% cheaper | Adds browser smoke across all canonical routes plus Lighthouse, still skips Python QA and artifact build |
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

- one route scope (`home`) changed, but it still deserves:
  - nav/link validation
  - one desktop browser pass
  - one mobile browser pass
  - homepage alignment verification

### Scenario C — shared nav/runtime change

Expected gate:

- `shared-ui`

Why:

- change affects multiple pages through shared runtime and could break:
  - navigation everywhere
  - mobile menu behavior
  - GA event wiring
  - shared visual contracts

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

1. Do the five gates still feel intuitive now that `localized-page` has a real browser pass?
2. Does the current production smoke browser scope (`home`, `framework`, `connect`) feel like the right lightweight set?
3. Do you want one more explicit browser contract for `services` or `about`, or is static coverage enough there?
4. Do the named “visual contract” protections reflect the breakage you worry about most?
5. Does this still feel meaningfully more efficient than replaying full regression for every medium-sized change?

## Recommended Next Step After Review

If the gate matrix looks right tomorrow, the next good move is:

1. run one real `localized-page` release
2. capture the metrics JSON
3. compare it directly against a full-regression run
4. document the observed delta in minutes, not just percentages

That will give us the first real before/after proof.
