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
| Editorial Feature Card | Primary narrative or chapter | 24–32px padding, 14px radius, feature shadow |
| Static Callout Surface | Summary, philosophy, audience, or guidance | 16–24px padding, 12px radius, calm background; never a faux button |
| Form / Input Surface | Contact and input grouping | 20–40px padding, 12px radius, standard shadow |

Interaction is a modifier, never a sixth card type. Valid modifiers are `is-static`, `is-interactive`, `is-linked`, `is-expandable`, `has-icon`, `has-index`, `has-media`, `is-semantic-stage`, and `is-artifact`.

## Shared rules

- Use the `ui-surface` architecture and page-specific selectors when a markup rewrite would add risk. Base variants: `ui-surface--compact`, `--standard`, `--editorial`, `--callout`, and `--form`.
- Shared tokens live in `styles/site.css`: blue `#3b6cff`, strong blue `#2457d6`, faint blue `rgba(59,108,255,.07)`, and the compact, standard, and feature shadow tiers.
- Static surfaces have `cursor: default`, do not lift, and do not acquire button-like hover behavior. Linked and interactive surfaces may lift at most 2px on pointer devices.
- Preserve semantic architecture colors, existing stage colors, approved service icons, copy, routes, and analytics. Never add a generic icon, emoji, Unicode symbol, or duplicate/reuse an icon merely to decorate a card.
- Give keyboard focus a visible blue outline. Maintain 44px targets for interactive controls. At small widths, cards remain single-column with reduced padding and no horizontal clipping. Honor `prefers-reduced-motion`.
- Do not create filler cards. If content has no functional or grouping purpose, let it stay in the page flow.

## Route inventory and intentional exceptions

| Route / family | Surface classification | Notes |
| --- | --- | --- |
| `/` | Exception | Logo-experience cells retain their custom treatment; no new chrome or icons. |
| `/about/` | Editorial Feature + Static Callout | Career chapters are quiet editorial surfaces; Operating Philosophy is a static callout. |
| `/framework/` and deep dives | Editorial / Standard / Static Callout | Stage cards remain linked and semantic; preserve existing icons and stage colors. |
| `/resources/` | Standard + Linked / Artifact | Resource entries remain clearly navigable; artifact CTAs keep their download behavior. |
| `/resources/ai-enabled-operations-dashboard/` | Compact + Standard Static | Questions, quadrants, and core views are scan-friendly static units. |
| `/resources/agentic-ai-employees/` | Standard / Semantic Stage | Preserve architecture colors and diagrams; no icon additions. |
| `/resources/ai-enabled-operations-framework-summary/` | Static Callout + Artifact | Audience and conversation blocks are static; the brief is a linked artifact surface. |
| `/resources/pasteflow/` | Standard / Static / Linked / Media | Capability and audience groups gain hierarchy without changing product character. |
| `/insights/` | Editorial + Interactive + Expandable | Briefs are clearly expandable and retain their existing controls. |
| `/services/` | Deliberate static editorial entries | Preserve the five distinct approved service icons and their order. |
| `/connect/` | Form / Linked | The form is static containment; LinkedIn and action routes remain linked. |

## QA and release

Validate at 1440, 1280, 1024, 768, 430, 390, and 320px. Check that static surfaces do not imply clickability, keyboard focus is visible, accordions still work, and no new or repeated icons appear. Refresh visual baselines only after manual approval of the staging result.
