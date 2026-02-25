const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const read = (relPath) => fs.readFileSync(path.join(root, relPath), 'utf8');

describe('Typography regression guardrails', () => {
  const siteCss = read('styles/site.css');
  const homeCss = read('styles/home.css');
  const aboutCss = read('styles/about.css');
  const servicesCss = read('styles/services.css');
  const insightsCss = read('styles/insights.css');

  test('site.css defines shared font token and applies it to html/body', () => {
    expect(siteCss).toMatch(/--font-sans\s*:/);
    expect(siteCss).toMatch(/html\s*,\s*\n?body\s*\{[\s\S]*font-family\s*:\s*var\(--font-sans\)/);
  });

  test('about.css and services.css do not define font-family', () => {
    expect(aboutCss).not.toMatch(/font-family\s*:/);
    expect(servicesCss).not.toMatch(/font-family\s*:/);
  });

  test('about.css and services.css do not define global h1 ownership selectors', () => {
    const banned = /(main\s+h1|\.page-main\s+h1)\s*\{/;
    expect(aboutCss).not.toMatch(banned);
    expect(servicesCss).not.toMatch(banned);
  });

  test('site.css is the only file that defines h1 font-size', () => {
    expect(siteCss).toMatch(/--h1-size-desktop\s*:\s*32px/);
    expect(siteCss).toMatch(/h1\s*\{[\s\S]*font-size\s*:\s*var\(--h1-size-desktop\)/);
    expect(homeCss).not.toMatch(/h1\s*\{[^}]*font-size\s*:/);
    expect(aboutCss).not.toMatch(/h1\s*\{[^}]*font-size\s*:/);
    expect(servicesCss).not.toMatch(/h1\s*\{[^}]*font-size\s*:/);
    expect(insightsCss).not.toMatch(/h1\s*\{[^}]*font-size\s*:/);
    expect(homeCss).not.toMatch(/main\s+\.master-head\s+h1\s*\{[^}]*font-size\s*:/);
  });

  test('site.css owns list spacing baseline for pages and service-list', () => {
    expect(siteCss).toMatch(/\.page-main\s+ul\s*,\s*\n?main\s+ul\s*\{/);
    expect(siteCss).toMatch(/\.service-list\s*\{[\s\S]*padding-left\s*:\s*var\(--list-indent\)/);
  });
});
