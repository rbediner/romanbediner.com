/**
 * dashboard-wireframe-modal.js
 *
 * Purpose: Opens/closes the wireframe prototype modal on the AI-Enabled Operations Dashboard
 *   resource page. Injects iframe src lazily on first open to avoid loading the wireframe on
 *   every page view. Handles keyboard (Escape), backdrop click, and close button interactions.
 *
 * Architectural role: Standalone runtime module scoped entirely to the dashboard resource page.
 *   Reads DOM attributes (data-wireframe-trigger, data-wireframe-modal, data-wireframe-src, etc.)
 *   so no tight coupling to class names or HTML structure beyond the data contracts.
 *
 * Dependencies: Requires data-wireframe-* attributes present in the dashboard resource HTML.
 *   No external libraries. No build step — plain IIFE, ES5-compatible.
 *
 * Security/CSP considerations: Must remain an external .js file. The dashboard resource page
 *   enforces a CSP that blocks inline scripts (no 'unsafe-inline' in script-src).
 *   The wireframe iframe src points to a same-origin static asset only.
 *
 * Migration considerations: If the wireframe asset path changes, update data-wireframe-src
 *   in resources/ai-enabled-operations-dashboard/index.html and the QA assertion in
 *   QA/tests/test-resources-phase1.js. The modal JS itself needs no change.
 */
(function () {
  'use strict';

  var modal = document.querySelector('[data-wireframe-modal]');
  var trigger = document.querySelector('[data-wireframe-trigger]');
  var backdrop = document.querySelector('[data-wireframe-backdrop]');
  var closeBtn = document.querySelector('[data-wireframe-close]');
  var iframe = modal ? modal.querySelector('[data-wireframe-src]') : null;

  if (!modal || !trigger || !iframe) return;

  var wireframeSrc = iframe.getAttribute('data-wireframe-src');
  var loaded = false;

  function openModal() {
    if (!loaded) {
      iframe.setAttribute('src', wireframeSrc);
      loaded = true;
    }
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('wireframe-modal-open');
    closeBtn.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.classList.remove('wireframe-modal-open');
    trigger.focus();
  }

  trigger.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}());
