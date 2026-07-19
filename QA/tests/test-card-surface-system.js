/**
 * Invariant:
 * - The canonical contained-surface taxonomy, approved references, and accessibility affordances remain available.
 * Why this exists:
 * - Prevents a later page change from reintroducing ungoverned card patterns, duplicate icons, or false click affordances.
 * What breaks if it fails:
 * - CI blocks deployment before the site-wide surface system silently drifts.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const docs = read('docs/design-system/card-surfaces/README.md');
const css = read('styles/site.css');
const services = read('services/index.html');
const about = read('about/index.html');
const resourcesCss = read('styles/resources.css');
const frameworkCss = read('styles/framework.css');
const agentic = read('resources/agentic-ai-employees/index.html');

['card-design-system-visual-reference.png', 'card-design-system-inventory-and-implementation-spec.png'].forEach((file) => {
  assert.ok(fs.existsSync(path.join(root, 'docs/design-system/card-surfaces', file)), `${file} must be retained`);
});
['Compact Surface', 'Standard Content Card', 'Editorial Feature Card', 'Static Callout Surface', 'Form / Input Surface'].forEach((type) => {
  assert.ok(docs.includes(type), `documentation must define ${type}`);
});
['.ui-surface--compact', '.ui-surface--standard', '.ui-surface--editorial', '.ui-surface--callout', '.ui-surface--form', '.ui-surface.is-static'].forEach((selector) => {
  assert.ok(css.includes(selector), `shared surface selector ${selector} must exist`);
});
assert.ok(css.includes('cursor: default'), 'static surfaces must not suggest clickability');
assert.ok(css.includes('@media (hover: hover)'), 'motion must be pointer-scoped');
assert.ok(css.includes(':focus-visible'), 'surface focus treatment must remain visible');
// Decorative numeric chips add no meaning to these card systems. Their labels,
// titles, and purpose-specific icons provide the durable hierarchy instead.
assert.ok(!services.includes('svc-num'), 'Services cards must not render numeric markers');
assert.ok(!about.includes('arc-index'), 'About cards must not render numeric markers');
assert.ok(!/content:\s*["']0["']\s*counter/.test(resourcesCss), 'Resource cards must not render numeric counter chips');
assert.ok(!/counter-(?:reset|increment):\s*framework-stage/.test(frameworkCss), 'Framework cards must not render numeric counter chips');
assert.ok(!/fleet-(?:proof-card|flow-card|reliability-node)[^>]*><span>0[1-9]<\/span>/.test(agentic), 'Agentic cards must not render numeric markers');
console.log('Card surface system contract passed.');
