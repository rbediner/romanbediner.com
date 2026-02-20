/**
 * Regression tests for Insights toggle analytics and structural wiring.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const { onInsightToggleClick } = require(path.join(root, 'scripts/insights-toggle.js'));

function createToggleHarness(options = {}) {
  const slug = options.slug || 'expected-slug';
  const title = options.title || 'Expected Title';
  const initiallyExpanded = options.initiallyExpanded || false;
  const pathname = options.pathname || '/insights/';

  const content = {
    attributes: {},
    toggleAttribute(name, force) {
      if (force) {
        this.attributes[name] = '';
      } else {
        delete this.attributes[name];
      }
    }
  };

  const article = {
    id: slug,
    querySelector(selector) {
      if (selector === 'h2') {
        return { textContent: title };
      }
      return null;
    }
  };

  const button = {
    textContent: initiallyExpanded ? 'Collapse -' : 'Expand +',
    attributes: {
      'aria-controls': `${slug}-content`,
      'aria-expanded': String(initiallyExpanded)
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    closest(selector) {
      if (selector === 'article') {
        return article;
      }
      return null;
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

  global.document = {
    getElementById(id) {
      return id === `${slug}-content` ? content : null;
    }
  };

  global.window = {
    location: { pathname }
  };

  return { article, button, content, target };
}

function extractInsightArticles(html) {
  return [...html.matchAll(/<article id="([a-z0-9-]+)" class="insight-card">([\s\S]*?)<\/article>/g)]
    .map((match) => ({ slug: match[1], articleHtml: match[2] }));
}

describe('Insights analytics runtime', () => {
  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  test('fires insight_toggle expand with required payload', () => {
    const { target } = createToggleHarness({ initiallyExpanded: false });
    window.gtag = jest.fn();

    onInsightToggleClick({ target });

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'insight_toggle',
      expect.objectContaining({
        insight_slug: 'expected-slug',
        insight_title: 'Expected Title',
        action: 'expand',
        page_path: '/insights/'
      })
    );
  });

  test('fires insight_toggle collapse with required payload', () => {
    const { target } = createToggleHarness({ initiallyExpanded: true, title: 'Operations as a Product' });
    window.gtag = jest.fn();

    onInsightToggleClick({ target });

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      'insight_toggle',
      expect.objectContaining({
        action: 'collapse',
        insight_title: 'Operations as a Product'
      })
    );
  });

  test('toggles aria-expanded, button text, and hidden attribute', () => {
    const { target, button, content } = createToggleHarness({ initiallyExpanded: false });

    onInsightToggleClick({ target });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.textContent).toBe('Collapse -');
    expect(content.attributes.hidden).toBeUndefined();

    onInsightToggleClick({ target });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent).toBe('Expand +');
    expect(content.attributes).toHaveProperty('hidden');
  });

  test('fails silently when gtag is unavailable', () => {
    const { target } = createToggleHarness({ initiallyExpanded: false });
    expect(() => onInsightToggleClick({ target })).not.toThrow();
  });
});

describe('Insights auto-discovery coverage', () => {
  test('every insight article has a toggle with aria-controls wiring', () => {
    const cards = extractInsightArticles(insightsHtml);
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      expect(card.articleHtml).toMatch(/class="insight-toggle"/);
      expect(card.articleHtml).toMatch(/aria-controls="[a-z0-9-]+-content"/);
    }
  });
});
