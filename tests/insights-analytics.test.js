/**
 * Regression tests for Insights expand/collapse analytics.
 * These tests enforce event names, payload shape, and automatic card coverage.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const insightsHtml = fs.readFileSync(path.join(root, 'insights/index.html'), 'utf8');
const {
  INSIGHT_COLLAPSE_EVENT,
  INSIGHT_EXPAND_EVENT,
  bindInsightToggle,
  fireInsightAnalytics
} = require(path.join(root, 'scripts/insights-briefs.js'));

function createToggleHarness(slug, title) {
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
      contains(className) {
        return classSet.has(className);
      },
      toggle(className, shouldExist) {
        if (shouldExist) {
          classSet.add(className);
        } else {
          classSet.delete(className);
        }
      }
    }
  };

  const button = {
    attributes: { 'aria-expanded': 'false' },
    textContent: 'Expand +',
    closest(selector) {
      if (selector === '.insight-card') {
        return card;
      }
      return null;
    },
    addEventListener(eventName, callback) {
      listeners[eventName] = callback;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    }
  };

  return { button, listeners };
}

function extractInsightCards(html) {
  return [...html.matchAll(/<section id="([a-z0-9-]+)" class="insight-card">([\s\S]*?)<\/section>/g)]
    .map((match) => ({ slug: match[1], sectionHtml: match[2] }));
}

describe('Insights analytics runtime', () => {
  beforeEach(() => {
    // Use fake timers so the guarded retry can be deterministically asserted.
    jest.useFakeTimers();

    global.window = {
      location: {
        hostname: 'example.com',
        search: ''
      }
    };
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    delete global.window;
  });

  test('fires insight_expand then insight_collapse with required payload', () => {
    window.gtag = jest.fn();

    const { button, listeners } = createToggleHarness('expected-slug', 'Expected Title');
    bindInsightToggle(button);

    expect(typeof listeners.click).toBe('function');

    // Strict expand assertion: event name and payload keys must be present and correct.
    listeners.click();
    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      INSIGHT_EXPAND_EVENT,
      expect.objectContaining({
        insight_slug: 'expected-slug',
        insight_title: 'Expected Title'
      })
    );
    expect(window.gtag).not.toHaveBeenCalledWith('event', INSIGHT_EXPAND_EVENT);

    // Strict collapse assertion with payload integrity.
    listeners.click();
    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      INSIGHT_COLLAPSE_EVENT,
      expect.objectContaining({
        insight_slug: 'expected-slug',
        insight_title: 'Expected Title'
      })
    );
    expect(window.gtag).not.toHaveBeenCalledWith('event', INSIGHT_COLLAPSE_EVENT);
  });

  test('does not throw when window.gtag is undefined and retry remains guarded', () => {
    const { button, listeners } = createToggleHarness('test-slug', 'Test Insight');
    bindInsightToggle(button);

    expect(() => listeners.click()).not.toThrow();
    expect(() => jest.advanceTimersByTime(300)).not.toThrow();
  });

  test('does not send analytics when slug is empty', () => {
    window.gtag = jest.fn();
    const { button, listeners } = createToggleHarness('', 'Expected Title');
    bindInsightToggle(button);

    listeners.click();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  test('does not send analytics when title is empty', () => {
    window.gtag = jest.fn();
    const { button, listeners } = createToggleHarness('expected-slug', '');
    bindInsightToggle(button);

    listeners.click();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  test('retry sends full payload once gtag becomes available before retry', () => {
    const { button, listeners } = createToggleHarness('expected-slug', 'Expected Title');
    bindInsightToggle(button);

    // First click schedules retry while gtag is unavailable.
    listeners.click();
    window.gtag = jest.fn();
    jest.advanceTimersByTime(300);

    expect(window.gtag).toHaveBeenCalledWith(
      'event',
      INSIGHT_EXPAND_EVENT,
      expect.objectContaining({
        insight_slug: 'expected-slug',
        insight_title: 'Expected Title'
      })
    );
    expect(window.gtag).not.toHaveBeenCalledWith('event', INSIGHT_EXPAND_EVENT);
  });

  test('throws in debug mode when payload data is missing', () => {
    window.location.hostname = 'localhost';
    expect(() => fireInsightAnalytics(INSIGHT_EXPAND_EVENT, '', 'Expected Title')).toThrow(
      '[insights] missing analytics payload data'
    );
  });

  test('event names are exact and protected against accidental renames', () => {
    expect(INSIGHT_EXPAND_EVENT).toBe('insight_expand');
    expect(INSIGHT_COLLAPSE_EVENT).toBe('insight_collapse');
  });
});

describe('Insights auto-discovery coverage', () => {
  test('every insight-card section has an insight-toggle button', () => {
    const cards = extractInsightCards(insightsHtml);
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      // Every new card must contain the standard toggle class to inherit analytics binding.
      expect(card.sectionHtml).toMatch(/class="insight-toggle"/);
    }
  });
});
