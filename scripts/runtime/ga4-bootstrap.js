/*
 * Purpose:
 * - Bootstrap Google Analytics from page metadata without inline scripts.
 *
 * Architectural role:
 * - Central analytics entrypoint reused by all canonical pages.
 *
 * Dependencies:
 * - Browser DOM APIs and Google Tag Manager hosted gtag loader.
 *
 * Security/CSP considerations:
 * - Keeps analytics initialization in an external file to avoid inline script requirements.
 * - Must stay compatible with strict CSP script-src/connect-src allowlists.
 *
 * Migration considerations:
 * - Preserve the meta-tag based measurement contract when moving hosts or templating systems.
 */
/*
  Shared GA4 bootstrap.
  Reads measurement ID from <meta name="ga4-measurement-id" content="...">.
  Loads gtag.js asynchronously and initializes tracking.
*/
(function () {
  var meta = document.querySelector('meta[name="ga4-measurement-id"]');
  var measurementId = meta && meta.content ? meta.content.trim() : '';
  var envMeta = document.querySelector('meta[name="analytics-environment"]');
  var envOverride = envMeta && envMeta.content ? envMeta.content.trim().toLowerCase() : '';
  var hostname = window.location.hostname || '';
  var environment = 'unknown';
  var validEnvironments = new Set(['production', 'preview', 'staging', 'local']);

  if (envOverride && validEnvironments.has(envOverride)) {
    environment = envOverride;
  } else if (hostname === 'romanbediner.com') {
    environment = 'production';
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    environment = 'local';
  } else if (hostname.endsWith('github.io')) {
    environment = 'preview';
  } else if (hostname.startsWith('staging.')) {
    environment = 'staging';
  }

  // Fail silently when GA is not configured.
  if (!measurementId) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.__rbAnalytics = window.__rbAnalytics || {};
  window.__rbAnalytics.measurementId = measurementId;
  window.__rbAnalytics.environment = environment;
  window.__rbAnalytics.trackEvent = function trackEvent(eventName, params) {
    if (typeof window.gtag !== 'function' || !eventName) {
      return;
    }

    var payload = Object.assign({}, params || {}, {
      environment: environment
    });
    window.gtag('event', eventName, payload);
  };

  var loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  loader.onload = function () {
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      debug_mode: environment !== 'production'
    });
  };

  document.head.appendChild(loader);
})();
