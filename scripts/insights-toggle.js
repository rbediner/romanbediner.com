(function () {
  'use strict';

  function onInsightToggleClick(e) {
    const button = e.target.closest('.insight-toggle');
    if (!button) {
      return;
    }

    // Resolve the related article and expandable content region from ARIA wiring.
    const article = button.closest('article');
    const contentId = button.getAttribute('aria-controls');
    const content = contentId ? document.getElementById(contentId) : null;
    const expanded = button.getAttribute('aria-expanded') === 'true';

    if (!article || !content) {
      return;
    }

    // Keep control state, label, and visibility synchronized for accessibility and analytics accuracy.
    if (article.classList && typeof article.classList.toggle === 'function') {
      article.classList.toggle('expanded', !expanded);
    }
    button.setAttribute('aria-expanded', String(!expanded));
    // Keep explicit prefix tokens so the next action is scannable at a glance.
    button.textContent = expanded ? '+ Expand' : '- Collapse';
    content.toggleAttribute('hidden', expanded);

    // Derive analytics values from page structure to avoid duplicate hard-coded metadata.
    const insightSlug = article.id;
    const titleNode = article.querySelector('h2');
    const insightTitle = titleNode ? titleNode.textContent.trim() : '';

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'insight_toggle', {
        insight_slug: insightSlug,
        insight_title: insightTitle,
        action: expanded ? 'collapse' : 'expand',
        page_path: window.location.pathname
      });
    }
  }

  function initializeInsightsToggleDelegation() {
    // Delegate clicks at the document level so one handler supports all current and future insight cards.
    document.addEventListener('click', function (e) {
      onInsightToggleClick(e);
    });
  }

  // Bind in browsers only; tests can call the handler directly.
  if (typeof document !== 'undefined') {
    initializeInsightsToggleDelegation();
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      initializeInsightsToggleDelegation,
      onInsightToggleClick
    };
  }
})();
