/*
 * Invariant: Services keeps each active role/company pairing on its own line.
 * Why this exists: the About page established this as the readable current-work pattern.
 * What breaks if it fails: responsibilities collapse into an unreadable all-caps paragraph.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(root, 'services', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles', 'services.css'), 'utf8');

if (html.match(/class="responsibility-entry"/g)?.length !== 3) {
  throw new Error('Services must render three separately scannable responsibility entries.');
}

if (html.match(/class="svc-best-fit"/g)?.length !== 5) {
  throw new Error('Every service model must end with a Best suited for statement.');
}

for (const selector of [
  '.current-responsibility-line {',
  '.current-responsibility-line .responsibility-entry',
  '.current-responsibility-line .responsibility-label'
]) {
  if (!css.includes(selector)) {
    throw new Error(`Services responsibility layout is missing ${selector}.`);
  }
}

console.log('PASS: Services responsibility layout matches the About grouping pattern.');
