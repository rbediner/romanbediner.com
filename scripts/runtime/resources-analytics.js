/*
 * Purpose:
 * - Track resource-specific interactions that are not covered by the global site-navigation tracker.
 * - Events: resource_pdf_download, resource_card_click.
 *
 * Architectural role:
 * - Follows the same convention as framework-brief-analytics.js.
 * - Uses window.__rbAnalytics.trackEvent() provided by ga4-bootstrap.js.
 *
 * Dependencies:
 * - ga4-bootstrap.js must load before this script.
 * - Browser DOM APIs only.
 *
 * Security/CSP considerations:
 * - External runtime only; no inline handlers.
 *
 * Migration considerations:
 * - Add data-track-pdf-download to any new downloadable resource links to automatically enable tracking.
 * - Add data-resource-card="<name>" to any new resource card articles to enable hub click tracking.
 */
(function initResourcesAnalytics() {
  function waitForAnalytics(cb) {
    if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === 'function') {
      cb();
    } else {
      window.addEventListener('load', cb, { once: true });
    }
  }

  waitForAnalytics(function () {
    // PDF download tracking
    document.querySelectorAll('[data-track-pdf-download]').forEach((link) => {
      link.addEventListener('click', () => {
        window.__rbAnalytics.trackEvent('resource_pdf_download', {
          source_page: window.location.pathname,
          resource_name: 'ai-enabled-operations-framework-summary'
        });
      });
    });

    // Hub card click tracking (Resources hub -> summary page)
    document.querySelectorAll('[data-resource-card]').forEach((card) => {
      const primaryLink = card.querySelector('a.resource-primary-cta');
      if (!primaryLink) {
        return;
      }
      primaryLink.addEventListener('click', () => {
        window.__rbAnalytics.trackEvent('resource_card_click', {
          source_page: window.location.pathname,
          target_page: primaryLink.getAttribute('href'),
          resource_name: card.getAttribute('data-resource-card')
        });
      });
    });
  });
}());
