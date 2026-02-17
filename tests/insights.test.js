#!/usr/bin/env node
/**
 * Production Insights system validation:
 * 1) Card id/title/slug integrity
 * 2) README auto-generated link integrity
 * 3) GA expand/collapse event tracking behavior
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const { bindInsightToggle } = require(path.join(root, 'scripts/insights-briefs.js'));

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInsightCards(html) {
  const matches = [...html.matchAll(/<section id="([a-z0-9-]+)" class="insight-card">[\s\S]*?<h2>([^<]+)<\/h2>/g)];
  return matches.map((match) => ({ slug: match[1], title: match[2].trim() }));
}

function parseReadmeLinks(doc) {
  const blockMatch = doc.match(/<!-- AUTO-GENERATED INSIGHT LINKS START -->([\s\S]*?)<!-- AUTO-GENERATED INSIGHT LINKS END -->/);
  assert(blockMatch, 'README is missing auto-generated insight link markers.');

  const urlMatches = [...blockMatch[1].matchAll(/https:\/\/romanbediner\.com\/insights\/#([a-z0-9-]+)/g)];
  return urlMatches.map((match) => match[1]);
}

function testCardSlugStructure() {
  const cards = parseInsightCards(insightsHtml);
  assert(cards.length >= 3, 'Expected at least 3 insight cards.');

  const seen = new Set();
  for (const card of cards) {
    assert(card.slug, 'Insight card is missing id slug.');
    assert(!seen.has(card.slug), `Duplicate insight slug found: ${card.slug}`);
    seen.add(card.slug);

    assert(card.title, `Insight card ${card.slug} is missing h2 title.`);
    const expectedSlug = slugify(card.title);
    assert.strictEqual(
      card.slug,
      expectedSlug,
      `Insight slug does not match title for "${card.title}". Expected ${expectedSlug} but got ${card.slug}.`
    );
  }
}

function testReadmeLinksMatchInsights() {
  const cards = parseInsightCards(insightsHtml);
  const cardSlugs = cards.map((card) => card.slug).sort();
  const readmeSlugs = parseReadmeLinks(readme).sort();

  assert.deepStrictEqual(
    readmeSlugs,
    cardSlugs,
    'README insight links must exactly match all insight card slugs with no extras or omissions.'
  );

  // Ensure every generated hash link resolves to an actual element id.
  for (const slug of readmeSlugs) {
    assert(
      insightsHtml.includes(`id="${slug}"`),
      `README hash link #${slug} does not resolve to an element in insights/index.html.`
    );
  }
}

function createFakeToggleHarness(slug, title) {
  const listeners = {};
  const classSet = new Set();

  const card = {
    id: slug,
    querySelector(selector) {
      if (selector === 'h2') {
        return { textContent: title };
      }
      return null;
    },
    classList: {
      contains(name) {
        return classSet.has(name);
      },
      toggle(name, force) {
        if (typeof force === 'boolean') {
          if (force) {
            classSet.add(name);
          } else {
            classSet.delete(name);
          }
          return;
        }
        if (classSet.has(name)) {
          classSet.delete(name);
        } else {
          classSet.add(name);
        }
      }
    }
  };

  const button = {
    textContent: 'Expand +',
    attributes: {},
    closest(selector) {
      if (selector === '.insight-card') {
        return card;
      }
      return null;
    },
    addEventListener(name, callback) {
      listeners[name] = callback;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };

  return { button, listeners, card };
}

function testGaExpandEventBehavior() {
  const calls = [];
  const warnings = [];
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => warnings.push(args);
  global.gtag = (...args) => calls.push(args);

  const { button, listeners, card } = createFakeToggleHarness('operations-as-a-product', 'Operations as a Product');
  bindInsightToggle(button);
  assert(typeof listeners.click === 'function', 'Toggle click handler was not bound.');

  // First click expands and must trigger one GA event.
  listeners.click();
  assert(card.classList.contains('expanded'), 'Card should be expanded after first click.');
  assert.strictEqual(button.attributes['aria-expanded'], 'true', 'Button aria-expanded should be true on expand.');
  assert.strictEqual(button.textContent, 'Collapse -', 'Button text should switch to Collapse - on expand.');
  assert.strictEqual(calls.length, 1, 'GA event must fire once on expand.');
  assert.deepStrictEqual(calls[0], [
    'event',
    'insight_expand',
    {
      insight_slug: 'operations-as-a-product',
      insight_title: 'Operations as a Product'
    }
  ]);

  // Second click collapses and must emit insight_collapse.
  listeners.click();
  assert(!card.classList.contains('expanded'), 'Card should be collapsed after second click.');
  assert.strictEqual(button.attributes['aria-expanded'], 'false', 'Button aria-expanded should be false on collapse.');
  assert.strictEqual(button.textContent, 'Expand +', 'Button text should switch back to Expand + on collapse.');
  assert.strictEqual(calls.length, 2, 'GA collapse event must fire on second click.');
  assert.deepStrictEqual(calls[1], [
    'event',
    'insight_collapse',
    {
      insight_slug: 'operations-as-a-product',
      insight_title: 'Operations as a Product'
    }
  ]);

  delete global.gtag;
  listeners.click();
  assert.strictEqual(warnings.length, 1, 'Missing gtag should emit one warning.');
  assert(String(warnings[0][0]).includes('gtag unavailable'), 'Warning should include gtag unavailable message.');
  console.warn = originalConsoleWarn;
}

function run() {
  testCardSlugStructure();
  testReadmeLinksMatchInsights();
  testGaExpandEventBehavior();
  console.log('PASS: insights.test.js validations passed.');
}

run();
