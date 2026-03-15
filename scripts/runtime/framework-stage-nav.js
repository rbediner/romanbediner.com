/*
 * Purpose:
 * - Power clickable stage navigation and active-stage tracking on the framework hub diagram.
 *
 * Architectural role:
 * - Keeps sticky diagram stage state synchronized with the currently visible framework card.
 * - Provides smooth scrolling without inline handlers to preserve CSP guarantees.
 *
 * Dependencies:
 * - Hub page markers with `[data-stage]` + stage links using `.framework-progress-link`.
 * - Framework cards with matching `[data-stage]` and `id`.
 *
 * Security/CSP considerations:
 * - External script only; no inline event handlers or inline script required.
 *
 * Migration considerations:
 * - Stage mapping depends on matching `[data-stage]` contracts between diagram markers and framework cards.
 * - Brief pages intentionally do not load this script because their diagram is cross-page navigation only.
 */
(function () {
  'use strict';

  function setActiveStage(stage, markerMap) {
    markerMap.forEach(function (marker, markerStage) {
      const isActive = markerStage === stage;
      marker.classList.toggle('is-active', isActive);
      const link = marker.querySelector('[data-stage-link]');
      if (link) {
        link.setAttribute('aria-current', isActive ? 'true' : 'false');
      }
    });
  }

  function initializeFrameworkStageNav() {
    const diagram = document.querySelector('.framework-diagram');
    if (!diagram) {
      return;
    }

    const markers = Array.from(diagram.querySelectorAll('.framework-progress-marker[data-stage]'));
    const cards = Array.from(document.querySelectorAll('.framework-card[data-stage]'));
    if (!markers.length || !cards.length) {
      return;
    }

    const markerMap = new Map();
    markers.forEach(function (marker) {
      markerMap.set(marker.getAttribute('data-stage'), marker);
    });

    diagram.addEventListener('click', function (event) {
      const link = event.target.closest('.framework-progress-link');
      if (!link) {
        return;
      }

      const hash = link.getAttribute('href');
      if (!hash || hash.charAt(0) !== '#') {
        return;
      }

      const target = document.querySelector(hash);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState(null, '', hash);
      }
    });

    const observer = new IntersectionObserver(
      function (entries) {
        let best = null;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (best) {
          setActiveStage(best.target.getAttribute('data-stage'), markerMap);
        }
      },
      {
        root: null,
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0.2, 0.35, 0.5, 0.65]
      }
    );

    cards.forEach(function (card) {
      observer.observe(card);
    });

    const initialStage = window.location.hash ? window.location.hash.replace('#', '') : cards[0].getAttribute('data-stage');
    if (markerMap.has(initialStage)) {
      setActiveStage(initialStage, markerMap);
    } else {
      setActiveStage(cards[0].getAttribute('data-stage'), markerMap);
    }
  }

  if (typeof document !== 'undefined') {
    initializeFrameworkStageNav();
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      initializeFrameworkStageNav
    };
  }
})();
