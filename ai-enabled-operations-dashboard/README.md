# AI-Enabled Operations Dashboard

A free, open-source single-screen executive operations dashboard prototype. Designed to run full-time on a 16:9 TV, desktop, or tablet. Fully interactive — flip tiles, rotate center views, and trigger fullscreen from the status bar.

---

## What It Shows

The dashboard brings demand, delivery, financial tension, customer pressure, and AI leverage into a single fixed-layout screen. It is structured around one spatial narrative:

- **Left** — demand generation and commercial quality. Pipeline health, conversion, and revenue forecast.
- **Center** — the core truth of the business right now. Rotates between Margin, Revenue, and AI views.
- **Right** — delivery efficiency and operational risk. Capacity pressure, onboarding friction, service health, and cycle time.
- **Bottom** — target context and the current action signal.

### Center Views

| View | What it shows |
|---|---|
| **Margin** | Operating margin, target, gap, trend, and the primary driver affecting performance |
| **Revenue** | Revenue truth or forecast, target, gap, trend, and the commercial driver affecting results |
| **AI** | Whether AI is producing measurable leverage, how far that is from target, and what is driving adoption or drag |

---

## Operating Principles

- One screen, one story
- Numeric first, not status-language first
- Show tension without clutter
- Keep the center as the truth anchor
- Treat AI as an operating signal, not a novelty
- Make customer and service pressure visible as part of margin pressure

---

## Quick Start

```bash
git clone https://github.com/rbediner/ai-enabled-operations-dashboard.git
cd ai-enabled-operations-dashboard
npm install
npm run dev
```

Open `http://localhost:5173/`

The dashboard renders at a fixed 1920×1080 canvas, uniformly scaled to fit any viewport.

---

## Customize It

All metric values and labels live in `src/data/dashboardData.js`. Swap them for your own business metrics to adapt the dashboard to your operating context.

```
src/data/dashboardData.js   ← tile values, labels, states
src/style-layer file         ← design system
src/components/              ← individual dashboard tiles
```

---

## Build and Deploy

```bash
npm run build    # outputs to dist/
npm run preview  # serve the build locally
```

The `prod` branch deploys to GitHub Pages automatically via `.github/workflows/deploy-pages.yml`.

---

## Capture Dashboard States

```bash
npm run screenshot
```

Requires dev server running. Saves PNG captures of all three center views to `screenshots/`.

---

## Tests

```bash
npm run test:unit   # unit tests for dashboardData
npm run test:qa     # dashboard QA verification
```

---

## What Is Included in This Repository

This repo contains the complete source package for the dashboard artifact:

| Path | What it is |
|---|---|
| `src/` | Dashboard source code (React/Vite) |
| `design/wireframe-prototype.html` | Interactive wireframe prototype used during design — open in any browser |
| `docs/PRD.md` | Product requirements document — current source of truth for the shipped prototype |
| `docs/HANDOFF-SOP.md` | Handoff and release procedures |

The repo is kept dashboard-only so you can package the full source with [Repomix](https://github.com/yamadashy/repomix) or similar tools without pulling unrelated website code.

---

## See It in Context

This dashboard is featured as a public resource on [romanbediner.com](https://romanbediner.com/resources/ai-enabled-operations-dashboard/), where it runs embedded in a full resource page alongside context on the operating principles behind it.

---

## Design Reference

`design/wireframe-prototype.html` — original layout wireframe. The live dashboard follows this mapping exactly.

---

## Notes

- Layout and box mapping follow the wireframe exactly — tile IDs (`T1–T6`, `D1–D4`, `C1–C3`, `M1–M3`, `H1–H4`, `O1–O3`, `R1–R4`, `B1–B11`) match the PRD in `docs/PRD.md`
- The fullscreen toggle is in the top status bar (4th column)
- `design/*.gdoc` files are Google Drive shortcut pointers to canonical source documents — **never delete, move, or rename them**
