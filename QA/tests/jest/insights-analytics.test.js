/**
 * Invariant: Framework migration removed legacy insights toggle runtime.
 * Why this exists: Prevents accidental reintroduction of expand/collapse brief logic.
 * What breaks if it fails: Framework UX contract and analytics contract drift from migration design.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const frameworkHtml = fs.readFileSync(path.join(root, 'framework/index.html'), 'utf8');
const redirectHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const navScript = fs.readFileSync(path.join(root, 'scripts/runtime/site-navigation.js'), 'utf8');

describe('Framework migration guardrails', () => {
  test('framework page contains no toggle controls or insight toggle script include', () => {
    expect(frameworkHtml).not.toMatch(/insight-toggle/);
    expect(frameworkHtml).not.toMatch(/brief-content/);
    expect(frameworkHtml).not.toMatch(/insights-toggle\.js/);
  });

  test('shared nav model includes Framework route and excludes legacy Insights label', () => {
    expect(navScript).toMatch(/\{\s*label:\s*["']Framework["']\s*,\s*href:\s*["']\/framework\/["']\s*\}/);
    expect(navScript).not.toMatch(/label:\s*["']Insights["']/);
  });

  test('/framework/ redirects to /framework/ with canonical continuity', () => {
    expect(redirectHtml).toMatch(/http-equiv="refresh"/);
    expect(redirectHtml).toMatch(/url=\/framework\//);
    expect(redirectHtml).toMatch(/rel="canonical" href="https:\/\/romanbediner\.com\/framework\/"/);
  });
});
