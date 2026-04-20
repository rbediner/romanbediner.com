# AI-Enabled Operations Dashboard PRD — As Built

> **Status:** This is the current source-of-truth PRD for the shipped prototype — a generic wall-mounted executive dashboard designed for a 16:9 TV. Fork it, swap the tile values in `src/data/dashboardData.js` for your own business, and deploy. Keep any `.gdoc` shortcuts in `design/` in place (never delete `.gdoc` files). Where this doc and older language disagree, this doc wins.

---

## 1. Read This First

This document describes the AI-Enabled Operations Dashboard exactly as it runs today in `prod`. It is not an exploration — the prototype is shipped.

- **Stakeholder preview:** `npm run dev` + `npm run tunnel` → ephemeral `https://...trycloudflare.com` URL
- **Production:** fork the repo, wire up GitHub Pages (or any static host), and promote commits from `staging` to `prod`.

If a feature description in this document does not match the running dashboard, the running dashboard is right and this doc needs to be updated — not the other way around.

---

## 2. Product Purpose

A high-fidelity functional prototype meant to run full-time on a wall-mounted 16:9 TV in an executive's office. In a single glance it must answer:

1. Are we creating enough demand?
2. Are we closing good business?
3. Are we delivering efficiently?
4. Are we improving operating margin?
5. Is customer friction increasing?
6. Is AI creating real leverage?

**Primary user:** a CEO / founder.
**Secondary user:** a COO-style operator who uses it to run cadence, surface risk, and drive action.

The story is spatial: **Left** = demand creation and conversion. **Center** = the core operating truth right now. **Right** = delivery capacity and customer risk. **Bottom** = targets and what to do next.

---

## 3. Product Standard

Must feel like: premium device-grade operating console; calm, high-contrast, readable from across the room; operational and numerically meaningful.

Must not feel like: SaaS admin UI; grid of cards; slide mock; toy futuristic UI.

---

## 4. Non-Negotiable Principles

1. One screen, one story.
2. Center the truth.
3. Numbers, not vague words.
4. Connect demand, delivery, customer friction, AI, and economics.
5. AI is an operating signal, not a novelty badge.
6. Read from distance.
7. Show tension without clutter.

---

## 5. Screen Model

### 5.1 Frame and Scaling (new vs. original PRD)

- The dashboard is rendered inside a **fixed 1920×1080 `.screen-frame`** — everything (layout, typography, spacing) is designed at that canonical size.
- A JS effect computes `--dash-scale = min(innerWidth / 1920, innerHeight / 1080)` and applies it as `transform: scale(var(--dash-scale))` on the frame. The whole dashboard grows and shrinks as one unit; fonts, tiles, padding all stay proportional.
- The scale recomputes on `resize` and `fullscreenchange`.
- `.app-shell` uses `display: grid; place-items: center;` so the scaled frame is centered in the viewport. Non-16:9 windows letterbox cleanly.
- A **fullscreen toggle** lives as the 4th column of the top status bar (44px icon tile). It calls `document.documentElement.requestFullscreen()` / `exitFullscreen()` and mirrors state via a `fullscreenchange` listener. No mobile-card redesign, no iPad-portrait review layout — scaling replaces responsive breakpoints for this prototype.

### 5.2 Four-Region Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│ T1 Logo │ T2 Time / Lens / LIVE │ T3 Pipe Cov │ T4 Margin Gap │ T5 Friction │ T6 Cash │ ⛶ │
├──────────────┬───────────────────────────────┬──────────────────────────────┤
│ D1 New Opps  │                               │           O1 Utilization     │
│ D2 Pipeline  │     H1 Hero (tab-driven)      │           O2 AGI / FTE       │
│ D3 Stalled   │     H2 / H3 / H4 Target ±     │           O3 Onboarding      │
│ D4 Conv Rate │                               │                              │
│              │     (Margin │ Revenue │ AI)   │           R1 Capacity        │
│ C1 Forecast  │                               │           R2 Cycle Time      │
│ C2 Close Rt  │                               │           R3 AI Gain         │
│ C3 Avg Deal  │                               │           R4 Client Friction │
├──────────────┴───────────────────────────────┴──────────────────────────────┤
│ B1 │ B2 │ B3 Rev Target │ B4 Cash Conv │ B5 Rocks │ B6 Focus Now │ B7 AI Gain │ B8 SLA │ B9 Esc │ B10 │ B11 │
└───────────────────────────────────────────────────────────────────────────────┘
```

Regions never reflow or reorder. The center module is the only region the tab selector changes.

---

## 6. Tile Map (Current Values)

All values in this table reflect the canonical base story in `src/data/dashboardData.js`. Live behavior layers ambient drift and scenario frames on top.

### 6.1 Top Bar

| ID | Label | Value | State | Notes |
|----|-------|-------|-------|-------|
| T1 | Wordmark | "AI-Enabled / Operations Dashboard" text lockup | — | Static |
| T2 | Time / Lens / LIVE | `DAY HH:MM`, "Lens: <lens>", "LIVE Nm ago" | — | Minute clock; LIVE heartbeat only persistent pulse on screen |
| T3 | Pipeline Cov | `2.8x` | green | |
| T4 | Margin Gap | `-5.8 pts` | yellow | |
| T5 | Client Friction | `18 pts` | red | |
| T6 | Cash Conv | `91%` | yellow | |
| — | Fullscreen toggle | icon button | — | Enters/exits browser fullscreen |

### 6.2 Left Rail — Demand Signals

| ID | Label | Value | State | Back face |
|----|-------|-------|-------|-----------|
| D1 | New Opps | `18` | green | `+4 vs prior` |
| D2 | Pipeline | `$1.84M` | green | `+$90K vs prior` |
| D3 | Stalled | `$420K` | yellow | — (no flip) |
| D4 | Conv Rate | `34%` | green | `Band 32–36%` |

### 6.3 Left Stack — Commercial Quality

| ID | Label | Value | Context | Status | State |
|----|-------|-------|---------|--------|-------|
| C1 | Forecast | `$612K` | Target $650K | -$38K to plan | yellow |
| C2 | Close Rate | `41%` | This quarter | +3 pts QoQ | green |
| C3 | Avg Deal | `$28K` | Last 30 days | Premium mix | green |

C1–C3 do not flip.

### 6.4 Center Module — Core Truth Engine

Three lens views, one at a time. Tab selector lives above the hero. H1 is the hero block; H2 / H3 / H4 are the target ± controls (Lower Target / <lens> Target / Raise Target).

| View | Lens label | Hero title | Value | Target | Gap | Trend | Driver | State |
|------|------------|------------|-------|--------|-----|-------|--------|-------|
| M1 | Margin | Operating Margin | `18.2%` | 24.0% | -5.8 pts | +1.4 pts MoM | Capacity deficit -9% | yellow |
| M2 | Revenue | Revenue Forecast | `$612K` | $650K | -$38K | +$24K MoM | Conversion gap -6 pts | yellow |
| M3 | AI | AI Leverage | `37%` | 48% | -11 pts | +5 pts QoQ | Adoption delta -11 pts | green |

On tab change, only these surfaces update: top-bar lens label (T2), center eyebrow, center title, hero number, target strip, support line, tab highlight. Nothing in the rails or bottom strip is allowed to move.

### 6.5 Right Stack — Delivery

| ID | Label | Value | Context | Status | State |
|----|-------|-------|---------|--------|-------|
| O1 | Utilization | `78%` | Efficiency band | On target | green |
| O2 | AGI / FTE | `$18.6K` | Monthly AGI | AI lift +14% | green |
| O3 | Onboarding | `9.5d` | Days to milestone | Client friction up | yellow |

O1–O3 do not flip.

### 6.6 Right Rail — Risk

| ID | Label | Value | State | Back face |
|----|-------|-------|-------|-----------|
| R1 | Capacity | `-9%` | red | — (sharpest risk signal; no flip) |
| R2 | Cycle Time | `4.8d` | yellow | `+0.3d vs prior` |
| R3 | AI Gain | `+14%` | green | `Adoption 37%` |
| R4 | Client Friction | `18 pts` | red | `+2 pts vs prior` |

### 6.7 Bottom Row — Targets and Action

| ID | Label | Value / Content | State | Back face |
|----|-------|-----------------|-------|-----------|
| B1 | Home utility | icon | — | — |
| B2 | Back utility | icon | — | — |
| B3 | Rev Target | `$650K` · Forecast $612K | slate | — |
| B4 | Cash Conv | `91%` · Target 95% · -4 pts | yellow | — |
| B5 | Rocks On Track | `7 / 9` · 2 behind | yellow | — |
| B6 | **Focus Now** | `Margin + Capacity` · 3 priority actions | alert | — (rotates text every 30s; no flip) |
| B7 | AI Gain | `+14%` · Target +18% | green | `+3 pts vs baseline` |
| B8 | SLA Met | `93%` · Target 95% | yellow | `-2 pts vs target` |
| B9 | Escalations | `4` · Target ≤2 | yellow | `+1 vs prior` |
| B10 | Alerts utility | icon | — | — |
| B11 | Presentation Mode | toggle | — | — |

---

## 7. Numeric Rule

Primary payloads must be one of: ratio, percent, point gap, score, count, bounded index, dollar value. Words like "Stable / Watch / Healthy" may appear only as secondary state cues, never as the primary value.

---

## 8. Interaction and Mode Model

### 8.1 Modes

- **Passive wall mode** (default): always-on, no input required. LIVE heartbeat, scheduled updates, auto-cycling tabs.
- **Manual review**: any click on a tab or flip tile pauses the relevant auto behavior briefly; everything else continues.
- **Presentation mode** (B11 toggle): suppresses flip motion and non-essential micro-animation while preserving freshness, numeric tweening, and critical overrides. Used when investors, board, or clients are in the room.
- **Fullscreen** (top-bar toggle): browser Fullscreen API on `document.documentElement`. Independent of presentation mode — either, both, or neither may be active.

### 8.2 Center Tab Auto-Cycle

- Cycles Margin → Revenue → AI → Margin every **30 seconds** in passive wall mode.
- **Manual tab click pauses the cycle for 90 seconds**, then resumes.
- Cycle is fully suppressed while presentation mode is active.
- Only the center module and top-bar lens label change on cycle. Rails and bottom strip do not move.

### 8.3 Flip Tiles

- **Eligible (9 tiles):** D1, D2, D4, R2, R3, R4, B7, B8, B9.
- **Ineligible:** T1–T6, H1–H4, C1–C3, D3, O1–O3, R1, B1–B6, B10, B11. (Core truth tiles, utility tiles, and R1 — the sharpest risk signal — never flip.)
- Front face always shows the primary operating metric. Back face shows a single short phrase: delta vs. prior, threshold band, or short driver context. Back-face text is wrapped with a 3-line clamp so no content overflows at any scale.
- **Auto-flip cadence:** 20–45 s per tile, deterministic per-tile interval. At most one tile flipped at a time. Adjacent simultaneous flips are disallowed.
- **Dwell:** flipped state holds briefly then returns. Hover pauses auto-flip on that tile.
- **Manual click** flips immediately and pauses that tile's auto-flip for an extra 12 s beyond the normal interval.
- Presentation mode resets all flip state and blocks further flips.

### 8.4 Discoverability Cues

Small static affordance on eligible tiles only. No pumping, shimmer, or "click me" label. Ineligible tiles stay completely free of any flip hint.

---

## 9. Live Behavior — Three-Clock Model

Three independent clocks drive motion. There is no single global tick.

### 9.1 Freshness clock

- Minute-based. Updates the wall clock in T2 and the "LIVE Nm ago" token.
- Also advances immediately on each simulated recompute.

### 9.2 Visual cadence clock — 4 s

- Every 4 seconds, at most one region has one visible micro-update.
- Region rotation: top bar → left (demand/commercial) → center → right (delivery/risk) → bottom.
- Within a region, at most one tile updates. Center treats hero + attached support values as one logical unit.
- If nothing changed in that region, the slot skips silently — no fake animation.

### 9.3 Simulated recompute clock — 24 s

- Every 24 s, the target dashboard advances one scenario frame.
- Scenario frames are deterministic (stable, pressure, recovery arcs) — never random drift.
- Recompute also advances freshness.

### 9.4 Focus-Now rotation — 30 s

- B6 text (primary / secondary issue + action summary) rotates through a short sequence every 30 s. Tile position and chrome never change.

### 9.5 Priority override

- If R1 (Capacity), T5 (Client Friction), C1 (Forecast), or B6 (Focus Now) crosses a critical threshold, the affected tile updates immediately and other updates are suppressed for 2 s.
- No more than one override per 10 s window.

### 9.6 Numeric motion

- Count-up / count-down tween only. Standard 450–900 ms; hero tween 700 ms ease-out.
- No bounce, odometer, slot-machine, arc theatrics beyond the hero.
- If the change is below visible precision, do not animate.

### 9.7 Color / state

- Four states only: stable, watch, pressure, critical. Color change requires crossing threshold + hysteresis buffer, minimum 30 s dwell, no flicker.
- Threshold-color-eligible tiles: T3, T4, T5, T6, D3, C1 (accent only), active center support accents, O1, O3, R1, R2, R3, R4, B4, B5, B7, B8, B9, B6 emphasis. Others stay in their base surface color.

---

## 10. Data Coherence

All values derive from a single simulated business model with enforced relationships:

- Forecast depends on pipeline and conversion.
- Margin depends on revenue, utilization, and cost assumptions.
- Capacity and cycle time move together directionally.
- AI Leverage influences AI Gain.
- Onboarding friction can worsen cycle time and client friction.
- Client friction flows through the right-side risk chain (T5 ↔ R4 ↔ B9).

### 10.1 Today (prototype)

Deterministic scenario frames drive all live updates. No external data sources are wired.

### 10.2 Future (live integration shape)

- **Monday.com:** opportunities, pipeline, stalled, conversion, onboarding, cycle time, rocks, AI-tagged delivery.
- **Finance/accounting:** margin, cash conversion, revenue target, AGI/FTE.
- **Support/service tracking:** SLA, escalations, client friction, client health.
- Normalize → dashboard API → front-end polls every ~15 s → diff → animate changed values only.
- Recommended per-metric payload: `value`, `displayValue`, `targetValue`, `deltaValue`, `state`, `trendDirection`, `lastUpdated`, `sourceSystem`, `driverLabel`.

---

## 11. Build, Release, and Operations

### 11.1 Stack

- Vite + React (SPA), deployed to GitHub Pages from the `prod` branch via `.github/workflows/deploy-pages.yml`.
- No backend. All simulated behavior runs client-side in `src/live/dashboardLiveModel.js`.

### 11.2 Branch model

- `staging` — all development and stakeholder review.
- `prod` — release branch. **Fast-forward only** from `staging`. Never edit `prod` directly.

### 11.3 npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server on `:5173` |
| `npm run tunnel` | Cloudflare tunnel → public `https://...trycloudflare.com` for stakeholder review |
| `npm run build` | Production build (output `dist/`, gitignored) |
| `npm run preview` | Serve the build locally |
| `npm run screenshot` | Capture M1 / M2 / M3 states and verification strip into `screenshots/` |
| `npm run test:unit` | Unit tests on `dashboardData` |
| `npm run test:qa` | Dashboard QA verification script |

### 11.4 Release workflow

1. Develop and commit on `staging`.
2. `npm run screenshot` — visually verify M1, M2, M3.
3. `npm run dev` + `npm run tunnel` for stakeholder review if needed.
4. Fast-forward promote: `git checkout prod && git merge --ff-only staging && git push origin prod`.
5. **Monitor the GitHub Pages deploy to success** (`gh run watch <id> --repo rbediner/ai-enabled-operations-dashboard --exit-status`). A release is not done until the Action run is green AND the live URL serves the new build.
6. Rewrite `docs/handoff/latest.md` with the new prod head, deploy status, and exact next step.

### 11.5 Acceptance (must all be true before calling a release done)

1. Four-region story is preserved.
2. Top-bar badges are numeric and meaningful.
3. Center tabs change only the center module.
4. Hero does not waste meaningful space.
5. Left-side economic weighting reads correctly.
6. Support and customer friction read as first-class operating pressure.
7. Bottom row is understandable without explanation.
8. Product feels like a premium device interface.
9. Screenshots match the running state.
10. Live behavior follows the three-clock rules, not improvised animation.
11. Dashboard scales uniformly and stays centered from laptop to wall TV; fullscreen toggles cleanly.
12. GitHub Pages deploy for the released commit is green.

---

## 12. Execution Guardrails

- Do not redesign the dashboard.
- Do not invent live behavior outside the three-clock model.
- Do not let utility tiles animate beyond approved on/off states.
- Do not flip core truth tiles (hero, C1–C3, R1, D3, etc.).
- Do not solve layout problems by moving tiles — fix them with behavior or hierarchy.
- **Never delete, move, rename, or overwrite any `.gdoc` file.** Google Doc shortcuts (e.g. `design/exec-dashboard-prd.gdoc`) are tiny pointers to canonical docs — deleting one destroys the link, and git cannot recover it meaningfully. Exclude `*.gdoc` from any cleanup.
- Treat this document as the execution spec, not a brainstorming space.

---

## 13. Non-Goals

- Full live BI stack.
- Mobile-phone layout.
- Client-facing reporting mode.
- Broad drill-down analytics.
- Arbitrary redesign exploration.
- Responsive reflow (iPad-portrait review mode, etc.) — replaced by uniform 16:9 scaling.

---

## 14. Source of Truth

1. **This document** (`docs/PRD.md`) — shipped prototype spec.
2. **Google Doc** — human-readable mirror; paste this document in to keep it current. The `.gdoc` shortcut at `design/exec-dashboard-prd.gdoc` must remain.
3. **`design/wireframe-prototype.html`** — layout reference.
4. **`docs/handoff/latest.md`** — current session state and release status.
5. **Code** — `src/data/dashboardData.js`, `src/live/dashboardLiveModel.js`, `src/App.jsx`.

If two sources conflict, priority is: running code > this document > Google Doc > wireframe.
