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

## Placeholder Brief Strategy
- Each brief page includes:
  - `FRAMEWORK` label
  - stage pill
  - brief title
  - full six-stage navigator with current stage highlight
  - intro line copied from the framework card
  - centered placeholder panel (`Brief in Development`)
  - next-stage navigation link
- Placeholder pages include GA4 meta + shared bootstrap for pageview tracking parity.

## Icon Asset System
- Active framework icons remain in `/assets/icons/framework/`.
- Unused framework icon candidates remain in `/assets/asset-library/icons/`.
- Icon optical offsets in `/styles/framework.css` are intentional and must not be normalized.
