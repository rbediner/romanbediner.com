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
