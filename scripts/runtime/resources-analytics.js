/*
 * Purpose:
 * - Track resource-specific GA4 interactions that are not covered by the
 *   global site-navigation tracker.
 * - Events (locked in PRD P3-AD-01):
 *     resource_card_click
 *     resource_pdf_download
 *   (resource_preview_expand is emitted by resources-carousel.js on modal open.)
 *
 * Architectural role:
 * - Follows the same convention as framework-brief-analytics.js.
 * - Uses window.__rbAnalytics.trackEvent() provided by ga4-bootstrap.js,
 *   which automatically adds the `environment` param.
 *
 * Event parameter contract (PRD P3-AD-01):
 *   resource_card_click:     resource_slug, resource_title, resource_type, resource_location
 *   resource_pdf_download:   resource_slug, resource_title, resource_type, resource_location, file_path
 *   resource_preview_expand: resource_slug, resource_title, resource_type, resource_location, slide_index
 *
 * Dependencies:
 * - ga4-bootstrap.js must load before this script.
 * - Browser DOM APIs only.
 *
 * Security/CSP considerations:
 * - External runtime only; no inline handlers.
 *
 * Migration considerations:
 * - Any resource card must carry the four data-resource-* attributes listed below.
 * - Any downloadable resource link must carry data-track-pdf-download and data-file-path.
 */
(function initResourcesAnalytics() {
  function waitForAnalytics(cb) {
    if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === 'function') {
      cb();
    } else {
      window.addEventListener('load', cb, { once: true });
    }
  }

  function readResourceContext(el) {
    const scope = el.closest('[data-resource-slug]') || document.querySelector('main[data-resource-slug]');
    if (!scope) {
      return {
        resource_slug: '',
        resource_title: '',
        resource_type: '',
        resource_location: ''
      };
    }
    return {
      resource_slug: scope.getAttribute('data-resource-slug') || '',
      resource_title: scope.getAttribute('data-resource-title') || '',
      resource_type: scope.getAttribute('data-resource-type') || '',
      resource_location: scope.getAttribute('data-resource-location') || ''
    };
  }

  waitForAnalytics(function () {
    document.querySelectorAll('[data-track-pdf-download]').forEach((link) => {
      link.addEventListener('click', () => {
        const ctx = readResourceContext(link);
        window.__rbAnalytics.trackEvent('resource_pdf_download', Object.assign({}, ctx, {
          file_path: link.getAttribute('data-file-path') || link.getAttribute('href') || ''
        }));
      });
    });

    document.querySelectorAll('[data-resource-card]').forEach((card) => {
      const primaryLink = card.querySelector('a.resource-primary-cta');
      if (!primaryLink) {
        return;
      }
      primaryLink.addEventListener('click', () => {
        const ctx = readResourceContext(card);
        window.__rbAnalytics.trackEvent('resource_card_click', ctx);
      });
    });
  });
}());
