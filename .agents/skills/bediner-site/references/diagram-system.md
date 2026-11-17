# Diagram system

Use this reference for architecture, org-chart, workflow, routing, and case-study visuals. Every diagram surface should have a fullscreen path when the page supports expansion.

## Canonical whiteboard frame

```css
background:
  linear-gradient(#eef1e6 1px, transparent 1px) 0 0 / 22px 22px,
  linear-gradient(90deg, #eef1e6 1px, transparent 1px) 0 0 / 22px 22px,
  #fcfbf3;
border: 1px solid #e4e0ce;
border-radius: 12px;
box-shadow: inset 0 0 0 6px #fff, 0 14px 30px rgba(15, 23, 42, .05);
```

Use inline SVG when CSP-safe typography, accessibility, or fullscreen cloning matters. Reuse existing zoom behavior; the lightbox should clone SVG and HTML/CSS diagrams, retain labels, offer fit/zoom, support touch scrolling, and return focus on close/Escape.

## Semantics

- Blue `#104275`: structure, runtime, flow, primary path.
- Red `#AB1D37`: review, risk, failure, rollback, alert, recovery.
- Gold `#B7A369`: human authority, approval boundary, important gate.
- Green `#2E6B5E`: verified, healthy, production-ready.
- Ink `#16222E`; muted `#5B6B7A`.

Use short labeled paths, not webs of connectors. Label `main`, `preview`, `on error`, `independent gate`, or `human decision` directly.

## Architecture examples (not universal topology)

Use these only when supported by the system being described. Do not force a four-layer fleet or these named agents into an unrelated blog, Framework stage or client architecture. Verify current role count and all shared-state consumers from evidence.

## Patterns

Architecture bands: Behavioral brain → Shared runtime → Control plane → Delivery body. Put the model router inside the control plane.

Org chart:

```text
Human Owner
    ↓
Director of Fleet Orchestration & Engineering
    ├── Project Manager
    ├── Chief of Staff
    └── Continuous Improvement Engineer

Staff Engineer = independent review / merge / deploy gate
```

Engineering loop: improvement queue → branch → pull request → deterministic CI → independent review → merge → deploy → verify → revert if unhealthy. Keep write and approve separate.

Reliability loop: heartbeats + Anthropic cost snapshots + cache savings + deploy status → Director health pass → digest/alert → routed recovery work or rollback.

## Responsive and accessible rules

Desktop may use horizontal flows; tablet collapses three-card grids to two columns; mobile stacks nodes and rotates arrows. Never allow page overflow. Blog diagrams must fit their article frame without an internal horizontal scroller; use the existing fullscreen touch zoom/pan for detailed reading. Other established resource diagram components may retain readable minimum width in their existing scrollable frame. Inspect the relevant route contract before choosing. Test 1440px, 768px, and 390px. Every SVG needs a title/caption, `role="img"`, precise `aria-label`, and non-color labels such as `independent gate` or `human authority`.
