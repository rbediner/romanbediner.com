/* Guards the canonical contained-surface contract without coupling pages to a markup rewrite. */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const docs = read('docs/design-system/card-surfaces/README.md');
const css = read('styles/site.css');

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
console.log('Card surface system contract passed.');
