// Use constants to keep analytics event names stable across runtime and tests.
const INSIGHT_EXPAND_EVENT = 'insight_expand';
const INSIGHT_COLLAPSE_EVENT = 'insight_collapse';

// Limit diagnostics to local development or explicit query opt-in.
function isInsightsDebugMode() {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }

  const hostname = window.location.hostname || '';
  const search = window.location.search || '';
  return hostname === 'localhost' || /\bga_debug=1\b/.test(search);
}

function logInsightsDebug(message, payload) {
  if (!isInsightsDebugMode()) {
    return;
  }

  if (typeof console !== 'undefined' && typeof console.debug === 'function') {
    console.debug(message, payload);
  }
}

function getInsightGtagFunction() {
  // Prefer browser-global gtag and fall back to globalThis for test harnesses.
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    return window.gtag;
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.gtag === 'function') {
    return globalThis.gtag;
  }

  return null;
}

function normalizeInsightValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildInsightPayload(slug, title) {
  // Normalize into plain string values so the GA payload is stable and JSON-safe.
  const insightSlug = normalizeInsightValue(slug);
  const insightTitle = normalizeInsightValue(title);

  if (!insightSlug || !insightTitle) {
    return null;
  }

  return {
    insight_slug: insightSlug,
    insight_title: insightTitle
  };
}

function assertInsightPayloadInDebug(payload) {
  if (!isInsightsDebugMode() || payload) {
    return;
  }

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn('[insights] missing analytics payload data', payload);
  }

  // Fail loudly in development to prevent silent analytics regressions.
  throw new Error('[insights] missing analytics payload data');
}

function hasDataLayerEvent(eventName) {
  if (typeof window === 'undefined' || !Array.isArray(window.dataLayer)) {
    return false;
  }

  return window.dataLayer.some((entry) => {
    if (Array.isArray(entry)) {
      return entry[1] === eventName;
    }

    if (entry && typeof entry === 'object' && typeof entry[1] !== 'undefined') {
      return entry[1] === eventName;
    }

    return false;
  });
}

// Fire analytics safely and retry once if GA bootstrap is still racing.
function fireInsightAnalytics(eventName, slug, title) {
  const payload = buildInsightPayload(slug, title);
  assertInsightPayloadInDebug(payload);

  // In production, skip invalid payloads rather than sending partial events.
  if (!payload) {
    return false;
  }

  function fireEvent() {
    const gtag = getInsightGtagFunction();
    if (typeof gtag !== 'function') {
      return false;
    }

    logInsightsDebug('[insights] sending payload:', {
      event: eventName,
      insight_slug: payload.insight_slug,
      insight_title: payload.insight_title
    });

    if (!payload.insight_slug || !payload.insight_title) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('[insights] missing analytics payload data', payload);
      }
      return false;
    }

    gtag('event', eventName, payload);

    if (eventName === INSIGHT_EXPAND_EVENT) {
      logInsightsDebug('[insights] expand fired', payload);
    } else if (eventName === INSIGHT_COLLAPSE_EVENT) {
      logInsightsDebug('[insights] collapse fired', payload);
    }

    // Optional runtime assertion: in debug mode, verify event reached dataLayer.
    if (isInsightsDebugMode() && !hasDataLayerEvent(eventName)) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('[insights] event not pushed to dataLayer');
      }
    }
    return true;
  }

  logInsightsDebug(
    '[insights] gtag typeof:',
    typeof getInsightGtagFunction()
  );
  if (fireEvent()) {
    return;
  }

  if (typeof setTimeout === 'function') {
    setTimeout(() => {
      fireEvent();
    }, 300);
  }
}

// Initialize expand and collapse behavior for Insights cards.
function bindInsightToggle(button) {
  const card = button.closest('.insight-card');
  if (!card) {
    return;
  }

  const titleNode = card.querySelector('h2');
  const insightTitle = titleNode ? titleNode.textContent.trim() : '';
  const insightSlug = card.id || '';

  button.addEventListener('click', () => {
    const isExpanded = !card.classList.contains('expanded');

    // Toggle card state and button accessibility state in one place.
    card.classList.toggle('expanded', isExpanded);
    button.setAttribute('aria-expanded', String(isExpanded));
    button.textContent = isExpanded ? 'Collapse -' : 'Expand +';

    fireInsightAnalytics(
      isExpanded ? INSIGHT_EXPAND_EVENT : INSIGHT_COLLAPSE_EVENT,
      insightSlug,
      insightTitle
    );
  });
}

// Bind all toggles on initial page load.
function initializeInsightToggles(rootDocument) {
  const context = rootDocument || document;
  const toggles = context.querySelectorAll('.insight-toggle');
  toggles.forEach((button) => bindInsightToggle(button));
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeInsightToggles(document);
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    INSIGHT_EXPAND_EVENT,
    INSIGHT_COLLAPSE_EVENT,
    buildInsightPayload,
    bindInsightToggle,
    fireInsightAnalytics,
    getInsightGtagFunction,
    hasDataLayerEvent,
    initializeInsightToggles,
    normalizeInsightValue,
    isInsightsDebugMode
  };
}
