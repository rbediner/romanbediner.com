# AI-Enabled Operations Dashboard

A free, open-source single-screen operations dashboard prototype designed for leadership review. It brings demand, delivery, financial tension, customer pressure, and AI leverage into a single structured view that can run full-time on a 16:9 display, desktop, or tablet.

## What It Shows

The dashboard follows one fixed operating story:

- **Left:** demand generation and commercial quality
- **Center:** the core truth of the business right now
- **Right:** delivery efficiency and operational risk
- **Bottom:** target context and the current action signal

The center view rotates between **Margin**, **Revenue**, and **AI**, while the rest of the screen preserves the same operating narrative.

## Operating Principles

- One screen, one story
- Numeric first
- Center the truth
- Customer pressure visible
- Clear action signals
- AI as operating signal

## Quick Start

```bash
git clone https://github.com/rbediner/ai-enabled-operations-dashboard.git
cd ai-enabled-operations-dashboard
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/)

The dashboard runs on a fixed `1920x1080` canvas and scales proportionally to fit the viewport.

## Customize the Data

Replace demo operating metrics while preserving the one-screen story:

```text
src/data/dashboardData.js   <- metric values, labels, states
src/components/             <- dashboard components
src/styles.css              <- visual system and layout styling
```

## What's Included

This repository contains the full source package for the artifact:

| Path | Description |
| --- | --- |
| `src/` | Dashboard source code (React / Vite) |
| `design/wireframe-prototype.html` | Original structural wireframe used to map the screen layout and information zones |
| `docs/PRD.md` | Working product requirements document describing the shipped dashboard behavior |
| `docs/HANDOFF-SOP.md` | Workflow and handoff guidance for maintaining the dashboard |

## Adapt It

```bash
npm run build
npm run preview
```

You can deploy the built dashboard to GitHub Pages or any static hosting environment.

```bash
npm run screenshot
npm run test:unit
npm run test:qa
```

These scripts help capture center-view states and verify current dashboard behavior.

## See It in Context

This dashboard is also featured as a public resource on [romanbediner.com](https://romanbediner.com/resources/ai-enabled-operations-dashboard/), where it appears in a dedicated artifact page with additional operating context.

## Notes

- Tile IDs and screen mapping align with the wireframe and PRD
- The fullscreen control lives inside the dashboard status bar
- Google Doc shortcut files in `design/` should be preserved
