/*
 * Purpose:
 * - Let readers copy the visible AI Project Manager starter templates directly
 *   from the resource page.
 *
 * Architectural role:
 * - Progressive enhancement for /resources/ai-project-manager/. Downloads and
 *   readable code blocks remain available if JavaScript is unavailable.
 *
 * Dependencies:
 * - Browser DOM and Clipboard APIs only; no libraries, network calls, or
 *   inline handlers.
 *
 * Security/CSP considerations:
 * - Loaded from 'self' as an external script. Copies visible static text only
 *   and never interprets it as HTML.
 *
 * Migration considerations:
 * - New copyable templates need an element id and a matching
 *   [data-copy-template] button. Missing targets safely do nothing.
 */
(function () {
  'use strict';
  document.querySelectorAll('[data-copy-template]').forEach(function (button) {
    button.addEventListener('click', function () {
      var source = document.getElementById(button.getAttribute('data-copy-template'));
      if (!source) return;
      navigator.clipboard.writeText(source.textContent.trim()).then(function () {
        var original = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(function () { button.textContent = original; }, 1600);
      });
    });
  });
}());
