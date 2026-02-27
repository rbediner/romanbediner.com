# Analytics QA Guide

## Insights Expand Tracking

Automated coverage exists in `/QA/tests/jest/insights-analytics.test.js` and validates:

- `insight_expand` event name and payload contract
- `insight_collapse` event name and payload contract
- No runtime exception when `window.gtag` is unavailable
- Auto-discovery guard that each `.insight-card` includes a `.insight-toggle`

## Manual Verification Steps

1. Run the site locally.
2. Open `http://localhost:8000/insights/?ga_debug=1` (or your local port).
3. Open browser DevTools Console.
4. Click `Expand +` on an insight card.
5. Confirm debug output includes:
   - `[insights] gtag typeof:`
   - `[insights] expand fired`
6. Click `Collapse -` on the same card.
7. Confirm debug output includes:
   - `[insights] gtag typeof:`
   - `[insights] collapse fired`
8. In GA4 DebugView or network telemetry, confirm both event names appear:
   - `insight_expand`
   - `insight_collapse`
9. Confirm event parameters include:
   - `insight_slug`
   - `insight_title`

## Expected Event Names

- `insight_expand`
- `insight_collapse`

## Verifying Parameter Transmission

1. Open `http://localhost:8000/insights/?ga_debug=1` (or your local port).
2. Click `Expand +` on an insight card.
3. Confirm console output includes `[insights] sending payload:` and shows:
   - `insight_slug`
   - `insight_title`
4. Open GA4 DebugView.
5. Select the `insight_expand` event.
6. Confirm the event parameters include:
   - `insight_slug`
   - `insight_title`

## Debug Mode Controls

Debug logs are enabled only when either condition is true:

- Hostname is `localhost`
- Query parameter `?ga_debug=1` is present

Debug logs are suppressed for normal production traffic.
