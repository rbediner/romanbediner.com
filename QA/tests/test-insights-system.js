#!/usr/bin/env node
/**
 * Invariant:
 * - Regression guardrails for test-insights-system.js.
 * Why this exists:
 * - Prevents architectural drift in routing, analytics, CSP, metadata, or shared UI contracts.
 * What breaks if it fails:
 * - CI blocks deployment to prevent production regressions.
 */
/**
 * Production Insights system validation:
 * 1) Card id/title/slug integrity
 * 2) README auto-generated link integrity
 * 3) GA insight_toggle event tracking behavior
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const { onInsightToggleClick } = require(path.join(root, 'scripts/runtime/insights-toggle.js'));

function parseInsightCards(html) {
  const matches = [...html.matchAll(/<article id="([a-z0-9-]+)" class="insight-card">[\s\S]*?<h2>([^<]+)<\/h2>/g)];
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
    assert(/^[a-z0-9-]+$/.test(card.slug), `Insight slug is not semantic kebab-case: ${card.slug}`);
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
  const content = {
    classState: new Set(['brief-content', 'collapsed']),
    classList: {
      toggle(name, force) {
        if (force) {
          content.classState.add(name);
        } else {
          content.classState.delete(name);
        }
      }
    }
  };

  const card = {
    id: slug,
    querySelector(selector) {
      if (selector === 'h2') {
        return { textContent: title };
      }
      return null;
    },
  };

  const button = {
    textContent: 'Expand +',
    attributes: {
      'aria-expanded': 'false',
      'aria-controls': `${slug}-content`
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    closest(selector) {
      if (selector === 'article') {
        return card;
      }
      return null;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };

  global.document = {
    getElementById(id) {
      return id === `${slug}-content` ? content : null;
    }
  };

  const target = {
    closest(selector) {
      if (selector === '.insight-toggle') {
        return button;
      }
      return null;
    }
  };

  return { button, target, card, content };
}

function testGaInsightToggleEventBehavior() {
  const calls = [];
  global.window = {
    gtag: (...args) => calls.push(args),
    location: { hostname: 'example.com', search: '', pathname: '/insights/' }
  };

  const { button, target, content } = createFakeToggleHarness(
    'operations-as-a-product-scalable-execution',
    'Operations as a Product for Scalable Execution'
  );

  // First click expands and must trigger one GA event.
  onInsightToggleClick({ target });
  assert.strictEqual(button.attributes['aria-expanded'], 'true', 'Button aria-expanded should be true on expand.');
  assert.strictEqual(button.textContent, '- Collapse', 'Button text should switch to - Collapse on expand.');
  assert.strictEqual(content.classState.has('expanded'), true, 'Content should have expanded class after expand.');
  assert.strictEqual(content.classState.has('collapsed'), false, 'Content should not have collapsed class after expand.');
  assert.strictEqual(calls.length, 1, 'GA event must fire once on expand.');
  assert.deepStrictEqual(calls[0], [
    'event',
    'insight_toggle',
    {
      insight_slug: 'operations-as-a-product-scalable-execution',
      insight_title: 'Operations as a Product for Scalable Execution',
      action: 'expand',
      page_path: '/insights/'
    }
  ]);

  // Second click collapses and must emit insight_toggle with collapse action.
  onInsightToggleClick({ target });
  assert.strictEqual(button.attributes['aria-expanded'], 'false', 'Button aria-expanded should be false on collapse.');
  assert.strictEqual(button.textContent, '+ Expand', 'Button text should switch back to + Expand on collapse.');
  assert.strictEqual(content.classState.has('collapsed'), true, 'Content should have collapsed class after collapse.');
  assert.strictEqual(content.classState.has('expanded'), false, 'Content should not have expanded class after collapse.');
  assert.strictEqual(calls.length, 2, 'GA collapse event must fire on second click.');
  assert.deepStrictEqual(calls[1], [
    'event',
    'insight_toggle',
    {
      insight_slug: 'operations-as-a-product-scalable-execution',
      insight_title: 'Operations as a Product for Scalable Execution',
      action: 'collapse',
      page_path: '/insights/'
    }
  ]);

  // Missing gtag must stay safe and never throw.
  delete global.window.gtag;
  assert.doesNotThrow(() => onInsightToggleClick({ target }));
  delete global.document;
  delete global.window;
}

function run() {
  testCardSlugStructure();
  testReadmeLinksMatchInsights();
  testGaInsightToggleEventBehavior();
  console.log('PASS: test-insights-system.js validations passed.');
}

run();
