# Framework Brief Architecture

## Hub and Brief Structure
- Framework hub route: `/framework/`
- Brief routes:
  - `/framework/opportunity/productizing-operations/`
  - `/framework/design/operations-as-product/`
  - `/framework/integration/ai-operating-layer/`
  - `/framework/execution/operational-lanes/`
  - `/framework/signals/operational-signals/`
  - `/framework/evolution/agentic-guardrails/`
- Framework cards stay in a vertical stack and include centered, neutral flow arrows between cards.
- Each card title and footer band (`Explore the Brief`) links to the matching brief route.
- The colored framework diagram is the only stage diagram on the hub and is sticky while scrolling cards.
- Hub diagram pills are in-page anchors (`#opportunity` to `#evolution`) and map to matching `id` + `data-stage` card contracts.
- Hub anchor navigation is smooth-scrolling and cards provide `scroll-margin-top` offset so sticky diagram does not clip landed headers.
- Active stage highlight is observer-driven (`.framework-progress-marker.is-active`) as cards enter view.
- Brief pages reuse the same colored diagram as cross-page stage navigation; current stage is highlighted and not clickable.
- Long-form brief header order is standardized as:
  - stage pill
  - H1
  - lead/deck (`.framework-intro.framework-lede`)
  - accent
  - stage diagram
- Brief top stage pills and left-rail spine pills share the outlined marker system:
  - transparent fill
  - 2px border using stage color (`currentColor`)
  - no hover affordance and no pointer interaction on top framework pills
  - stage color logic remains token-driven by `.stage-*` classes
  - implementation contract for future brief pages:
    - keep top brief marker as `<span class="framework-pill stage-pill badge-phase stage-<stage>">...`
    - keep spine marker as `<span class="badge-phase stage-pill stage-<stage> brief-sticky-stage">...`
    - do not convert top marker to links or add hover/pointer affordances
    - all stage color changes must come from `.stage-*` tokens in `/styles/framework.css`

## Stage Color Rules
- Stage colors apply only to:
  - stage pills on framework cards
  - stage pills in the framework diagram
  - framework diagram node dots
  - stage pills on brief pages
- Stage colors do not apply to:
  - card backgrounds
  - card borders
  - orb bullets
  - diagram connector line

## Orb Bullet Contract
- Use shared orb bullets from `.service-list` in `/styles/site.css`.
- Orb image path is `/assets/icons/home/bullet.png`.
- Do not use browser default bullets for framework thesis or stage lists.

## Brief Content Strategy
- All brief pages include:
  - `FRAMEWORK` label
  - stage pill
  - brief title
  - full six-stage navigator with current stage highlight
  - intro line copied from the framework card
  - next-stage navigation link
- Long-form briefs currently live at:
  - `/framework/opportunity/productizing-operations/`
  - `/framework/design/operations-as-product/`
  - `/framework/integration/ai-operating-layer/`
  - `/framework/execution/operational-lanes/`
  - `/framework/signals/operational-signals/`
  - `/framework/evolution/agentic-guardrails/`
- All brief pages include GA4 meta + shared bootstrap for pageview tracking parity.

## Icon Asset System
- Active framework icons remain in `/assets/icons/framework/`.
- Unused framework icon candidates remain in `/assets/asset-library/icons/`.
- Imported grid/source references (including the icon grid) are stored in `/assets/asset-library/concept-images/` (`/assets/asset-library/concept-images/icon-grid.jpg`).
- Icon optical offsets in `/styles/framework.css` are intentional and must not be normalized.
