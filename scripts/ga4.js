/*
 * Purpose:
 * - ga4.js supports static-site runtime or QA automation behavior.
 *
 * Architectural role:
 * - Encodes shared implementation contracts used by CI and production pages.
 *
 * Dependencies:
 * - Node.js and the repository file structure for canonical routes/assets.
 *
 * Migration considerations:
 * - If hosting model or route structure changes, update path assumptions and re-run QA.
 */
/*
  Shared GA4 bootstrap.
  Reads measurement ID from <meta name="ga4-measurement-id" content="...">.
  Loads gtag.js asynchronously and initializes tracking.
*/
(function () {
  var meta = document.querySelector('meta[name="ga4-measurement-id"]');
  var measurementId = meta && meta.content ? meta.content.trim() : '';

  // Fail silently when GA is not configured.
  if (!measurementId) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  var loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  loader.onload = function () {
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });
  };

  document.head.appendChild(loader);
})();
