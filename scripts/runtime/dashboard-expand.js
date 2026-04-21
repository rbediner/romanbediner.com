/**
 * dashboard-expand.js
 *
 * Purpose:
 * - Adds an explicit "EXPAND DASHBOARD" control for the dashboard resource page.
 * Architectural role:
 * - Provides a discoverable parent-page fullscreen affordance for the embedded iframe artifact.
 * Dependencies:
 * - Requires [data-dashboard-expand] button and .resource-dashboard-frame-iframe on the page.
 * Security/CSP considerations:
 * - Uses same-origin Fullscreen API only; no external network calls.
 * Migration considerations:
 * - If iframe selector or button data attribute changes, update query selectors below.
 */
(function () {
  var expandButton = document.querySelector('[data-dashboard-expand]');
  var dashboardFrame = document.querySelector('.resource-dashboard-frame-iframe');

  if (!expandButton || !dashboardFrame) {
    return;
  }

  function requestFrameFullscreen() {
    var request =
      dashboardFrame.requestFullscreen
      || dashboardFrame.webkitRequestFullscreen
      || dashboardFrame.mozRequestFullScreen
      || dashboardFrame.msRequestFullscreen;

    if (typeof request === 'function') {
      try {
        request.call(dashboardFrame);
      } catch (_error) {
        // Intentionally silent: browser may block fullscreen if not allowed.
      }
    }
  }

  expandButton.addEventListener('click', requestFrameFullscreen);
})();
