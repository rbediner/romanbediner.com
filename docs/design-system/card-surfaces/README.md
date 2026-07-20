# Card Surfaces

This is the canonical system for every contained or card-like surface on romanbediner.com. Read it before adding or changing one. The system creates editorial hierarchy and clear affordance; it is not a generic SaaS component kit.

## Approved visual references

- `card-design-system-visual-reference.png` — visual target, token treatment, spacing, and interaction restraint.
- `card-design-system-inventory-and-implementation-spec.png` — page inventory and implementation reference.

## Five base surface types

| Type | Use | Default treatment |
| --- | --- | --- |
| Compact Surface | Small facts, questions, or supporting units | 12–14px padding, 8px radius, quiet shadow |
| Standard Content Card | Resource, feature, or linked content unit | 16–20px padding, 12px radius, standard shadow |
| Editorial Feature Card | Primary narrative or chapter | 24–32px padding, 14px radius, feature shadow; no decorative number marker |
| Static Callout Surface | Summary, philosophy, audience, or guidance | 16–24px padding, 12px radius, calm background; never a faux button |
| Form / Input Surface | Contact and input grouping | 20–40px padding, 12px radius, standard shadow |

Interaction is a modifier, never a sixth card type. Valid modifiers are `is-static`, `is-interactive`, `is-linked`, `is-expandable`, `has-icon`, `has-index`, `has-media`, `is-semantic-stage`, and `is-artifact`.

## Shared rules

- Use the `ui-surface` architecture and page-specific selectors when a markup rewrite would add risk. Base variants: `ui-surface--compact`, `--standard`, `--editorial`, `--callout`, and `--form`.
- Shared tokens live in `styles/site.css`: blue `#3b6cff`, strong blue `#2457d6`, faint blue `rgba(59,108,255,.07)`, and the compact, standard, and feature shadow tiers.
- Static surfaces have `cursor: default`, do not lift, and do not acquire button-like hover behavior. Linked and interactive surfaces may lift at most 2px on pointer devices.
- Preserve semantic architecture colors, existing stage colors, approved service icons, copy, routes, and analytics. Decorative numeric chips/indexes are out of scope across card families; hierarchy comes from meaningful labels, titles, and icons. Never add a generic icon, emoji, Unicode symbol, or duplicate/reuse an icon merely to decorate a card.
- Give keyboard focus a visible blue outline. Maintain 44px targets for interactive controls. At small widths, cards remain single-column with reduced padding and no horizontal clipping. Honor `prefers-reduced-motion`.
- Do not create filler cards. If content has no functional or grouping purpose, let it stay in the page flow.

## Route inventory and intentional exceptions

| Route / family | Surface classification | Notes |
| --- | --- | --- |
| `/` | Exception | Logo-experience cells retain their custom treatment; no new chrome or icons. |
| `/about/` | Editorial Feature + Static Callout | Career chapters are quiet editorial surfaces; Operating Philosophy is a static callout. |
| `/framework/` and deep dives | Editorial / Standard / Static Callout | Stage cards remain linked and semantic; their labeled stage pills carry hierarchy without decorative icon tiles. |
| `/resources/` | Standard + Linked / Artifact | One flagship Agentic architecture card carries its inline preview and download. Supporting resources use compact horizontal editorial rows on desktop and clean single-column stacks on phone, rather than repeating the flagship's large vertical-card weight. |
| `/resources/ai-enabled-operations-dashboard/` | Compact + Standard Static | Questions, quadrants, and core views are scan-friendly static units. |
| `/resources/agentic-ai-employees/` | Standard / Semantic Stage | Preserve architecture colors and diagrams; no icon additions. |
| `/resources/ai-enabled-operations-framework-summary/` | Static Callout + Artifact | Audience and conversation blocks are static; the brief is a linked artifact surface. |
| `/resources/pasteflow/` | Standard / Static / Linked / Media | Capability and audience groups gain hierarchy without changing product character. |
| `/insights/` | Editorial + Interactive + Expandable | Briefs are clearly expandable and retain their existing controls. |
| `/services/` | Deliberate static editorial entries | Preserve the five distinct approved service icons and their order. |
| `/connect/` | Form / Linked | The form is static containment; LinkedIn and action routes remain linked. |

## Downloadable architecture artifacts

Use an `is-artifact` Static Callout or Standard Content Card only when a reader can take away a real, durable resource. Name the resource for what it is. Do not call a substantial architecture, case-study follow-along, or reference implementation a “brief” merely because it is downloadable.

- Keep the artifact description, preview, and download actions inside one unified surface. The action order is **Preview** first, then **Download**. Do not create a detached second preview card.
- The preview is closed by default, expands within the same surface, and uses images rendered from the exact canonical PDF. Use content-aware vocabulary: `Page` for a PDF document and `Slide` for a presentation deck.
- Keep the action row horizontal when space permits and stack it cleanly on narrow screens. Controls must retain visible focus, 44px targets, `min-width: 0`, and no page-level horizontal overflow.
- Preserve the established analytics DOM contract: artifact context on the containing resource surface, `data-track-pdf-download` and `data-file-path` on every download link, and the shared preview runtime/events. Presentation changes must never silently change the resource slug, file path, event names, or event parameters.
- Required visual QA: at 1440px and 390px, open the preview, advance at least one page, confirm the correct page count and no clipping or horizontal overflow, then confirm the download target remains the canonical file.

Current exemplar: `/resources/agentic-ai-employees/` uses the ten-page **Agentic Operations Architecture** PDF as one unified preview-and-download artifact surface.

## QA and release

Validate at 1440, 1280, 1024, 768, 430, 390, and 320px. Check that static surfaces do not imply clickability, keyboard focus is visible, accordions still work, and no new or repeated icons appear. Refresh visual baselines only after manual approval of the staging result.
