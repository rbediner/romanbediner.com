# Production-grounded design map

## Audit boundary and drift control

Static source audited against verified production object `f29163d57b5422f52e74e5dbb5d2300a1233009a` on November17,2026, not the newer staging candidate. This is source/selector inventory, not a fresh browser certification of every production route. Latest blog conversion rules are approved changes awaiting release; do not describe them as already live. Reconcile the current production SHA on future work, inspect the changed selectors/templates, and update this map only from code evidence. Run the exact applicable existing tests and loaded-font browser checks before calling a changed layout verified.

## Typography and component ownership

- `styles/site.css` owns self-hosted DM Sans (300–600) and Cormorant Garamond (400–600), `--font-sans/serif`, H1 desktop54/mobile34, weight400, line-height1.05, body16/1.55, lede26/600 and page-top-spacing72. H1/H2 are serif with `!important`; body is sans. These are defaults, not permission to overwrite route selectors.
- `.section-eyebrow` is13px/600, tracking.14em, uppercase blue. Read declarations, not stale nearby comments that say12px. Other named eyebrow components intentionally mirror it.
- Resources H1 is uppercase through `.resources-main h1`; shared H1 default is sentence case. Blogs inherit Resources/fleet treatment. Keep concise desktop blog display titles, longer deck/SEO text, natural mobile wrapping. Do not uppercase every route or force single-line Framework detail titles.
- There is NO universal32px H2. Blog body H2 uses clamp(30px,4vw,38px), H3 serif28px, body18/1.75 and opening serif30px. Resources cards use clamp(30px,3.1vw,40px), compact headings clamp(28px,2.6vw,34px). Framework stage H2 is18px, card H3 is30px (26px phone), brief heading31px (27px phone). Preserve actual semantic hierarchy and stylesheet ownership.
- Shared UI palette is accent `#2457d6`, ink `#111111`, secondary `#555555`. Diagram semantic blue `#104275` and paper/grid colors are separate. Existing shared card gradients/blue washes are intentional, not forbidden.
- Resources primary pills are48px high,22px inline padding,fully rounded,weight700. Metadata pills are34px/14px inline/12px. Inspect scoped mobile/blog exceptions rather than globally forcing widths/heights. Preserve nav CTA as its own component.
- Shared header/nav and footer use `scripts/runtime/site-navigation.js` and common contracts. Inspect actual DOM plus `QA/tests/test-header-nav.js`, nav-link and footer tests; preserve active-page identity, keyboard behavior, Connect CTA, and approved footer quotation attribution.

## Route coverage

Inventory below includes every production main-site `index.html`. Framework stages have topic AND `/brief/` pages; do not invent a stage-root index. `404.html` is separate and must retain HTTP404; dashboard source/dist is a distinct React/Vite app, not a main-site layout.

| Production route | H1 count in source | Stylesheet references |
|---|---:|---|
| `/about/` | 1 | `/styles/site.css`, `/styles/services.css`, `/styles/about.css` |
| `/blog/agentic-society/` | 1 | `/styles/site.css`, `/styles/resources.css`, `/styles/blog.css` |
| `/blog/ai-agent-attention-budget/` | 1 | `/styles/site.css`, `/styles/resources.css`, `/styles/blog.css` |
| `/blog/` | 1 | `/styles/site.css`, `/styles/resources.css`, `/styles/blog.css` |
| `/blog/make-judgment-reusable/` | 1 | `/styles/site.css`, `/styles/resources.css`, `/styles/blog.css` |
| `/blog/sunset-grove-ai-creative-agency/` | 1 | `/styles/site.css`, `/styles/resources.css`, `/styles/blog.css` |
| `/blog/what-ai-spend-buys/` | 1 | `/styles/site.css`, `/styles/resources.css`, `/styles/blog.css` |
| `/connect/` | 1 | `/styles/site.css`, `/styles/connect.css`, `https://cdn.quilljs.com/1.3.6/quill.snow.css` |
| `/framework/design/brief/` | 0 |  |
| `/framework/design/operations-as-product/` | 1 | `/styles/site.css`, `/styles/framework.css` |
| `/framework/evolution/agentic-guardrails/` | 1 | `/styles/site.css`, `/styles/framework.css` |
| `/framework/evolution/brief/` | 0 |  |
| `/framework/execution/brief/` | 0 |  |
| `/framework/execution/operational-lanes/` | 1 | `/styles/site.css`, `/styles/framework.css` |
| `/framework/` | 1 | `/styles/site.css`, `/styles/framework.css` |
| `/framework/integration/ai-operating-layer/` | 1 | `/styles/site.css`, `/styles/framework.css`, `/styles/integration-ai-operating-layer.css` |
| `/framework/integration/brief/` | 0 |  |
| `/framework/opportunity/brief/` | 0 |  |
| `/framework/opportunity/productizing-operations/` | 1 | `/styles/site.css`, `/styles/framework.css` |
| `/framework/signals/brief/` | 0 |  |
| `/framework/signals/operational-signals/` | 1 | `/styles/site.css`, `/styles/framework.css` |
| `/` | 1 | `/styles/site.css`, `/styles/home.css` |
| `/insights/` | 0 | `/styles/site.css` |
| `/privacy/` | 1 | `/styles/site.css` |
| `/resources/agentic-ai-employees/` | 1 | `/styles/site.css`, `/styles/resources.css` |
| `/resources/ai-enabled-operations-dashboard/` | 1 | `/styles/site.css`, `/styles/resources.css` |
| `/resources/ai-enabled-operations-framework-summary/` | 1 | `/styles/site.css`, `/styles/resources.css` |
| `/resources/ai-project-manager/` | 1 | `/styles/site.css`, `/styles/resources.css` |
| `/resources/` | 1 | `/styles/site.css`, `/styles/resources.css` |
| `/resources/pasteflow/` | 1 | `/styles/site.css`, `/styles/resources.css` |
| `/services/` | 1 | `/styles/site.css`, `/styles/services.css` |

## Diagram, content and SEO checks

Use `styles/blog.css` and `scripts/runtime/blog.js` for blog inline SVG/fullscreen behavior; resource architecture zoom uses its own existing runtime. Match labels, aria, captions, shared-state consumers and actual authority paths. Verify loaded-font bounds, arrow attachment, frame containment, touch zoom/pan/Fit, Escape/focus/scroll return and reduced motion. Diagrams illustrate the article, not a mandatory fleet topology.

Run relevant `QA/tests/test-route-metadata-parity.js`, `test-canonical.js`, `test-metadata-consistency.js`, `test-og-route-metadata.js`, `test-jsonld-schema.js`, `test-header-nav.js`, `test-shared-design-system.js`, `test-card-surface-system.js`, framework route/artifact/mobile checks, `test-agentic-diagram-zoom.js` and `test-blog.js` through normal repository runners. Verify schema matches visible content, route title/description/canonical and OG/Twitter agree, social images resolve and have correct type, dates are genuine, and sitemap/feed/hub links match inclusion status. Production canonical is apex/trailing-slash; preview is noindex with preview asset base paths. Do not confuse source correctness with crawled/indexed/ranking results.

When code and this map diverge, inspect current approved code and owner intent, resolve the discrepancy, update the canonical repository skill and verify the installed mirror bytes. Do not use this dated inventory to regress newer approved design. Keep a source SHA and a factual coverage/gaps note in handoff; a passing static check does not prove all rendered layouts.
