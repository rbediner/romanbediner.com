/*
 * Purpose:
 * - Give each architecture diagram a full-screen, zoomable lightbox so dense
 *   SVG and HTML/CSS diagrams are legible on mobile rather than trapped in a
 *   small framed viewport.
 *
 * Architectural role:
 * - Progressive enhancement for /resources/agentic-ai-employees/. The diagrams
 *   render and scroll without JS; this script only adds an "Expand" affordance
 *   and a modal viewer with fit/zoom toggling on top of the existing markup.
 *
 * Dependencies:
 * - Browser DOM APIs only (native <dialog>, no libraries, no inline handlers).
 *   Clones the live diagram node so it keeps the site's structure and palette.
 * - Optional window.__rbAnalytics.trackEvent() (from ga4-bootstrap.js) for GA4
 *   telemetry; degrades to a no-op when analytics is absent.
 *
 * Analytics events emitted (optional):
 * - fleet_diagram_fullscreen { diagram_index, diagram_label } on open
 * - fleet_diagram_zoom       { diagram_index, diagram_label } on zoom-in
 *
 * Security/CSP considerations:
 * - Loaded as an external module from 'self' (no inline script, no 'unsafe-inline').
 *   Creates DOM nodes programmatically and sets only style/class/text — no
 *   innerHTML from untrusted input, no network calls.
 *
 * Migration considerations:
 * - Generic over SVG and HTML/CSS diagram surfaces; if a selector changes,
 *   update DIAGRAM_SELECTOR. Safe no-op on pages without diagrams.
 */
(function () {
  'use strict';

  var DIAGRAM_SELECTOR = '.fleet-diagram, .fleet-zoomable-diagram';

  function trackEvent(eventName, params) {
    if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === 'function') {
      window.__rbAnalytics.trackEvent(eventName, params || {});
    }
  }

  function diagramLabel(frame, index) {
    var svg = frame.querySelector('svg');
    var label = frame.getAttribute('aria-label') || (svg && svg.getAttribute('aria-label'));
    if (!label) {
      var title = svg.querySelector('title');
      label = title && title.textContent ? title.textContent.trim() : '';
    }
    return label || ('diagram_' + index);
  }

  function buildLightbox() {
    var dialog = document.createElement('dialog');
    dialog.className = 'fleet-lightbox';
    dialog.setAttribute('aria-label', 'Diagram, full screen');

    var bar = document.createElement('div');
    bar.className = 'fleet-lightbox-bar';

    var zoomBtn = document.createElement('button');
    zoomBtn.type = 'button';
    zoomBtn.className = 'fleet-lightbox-zoom';
    zoomBtn.textContent = 'Zoom in';
    zoomBtn.setAttribute('aria-label', 'Toggle zoom');

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'fleet-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close full screen');
    closeBtn.textContent = '×';

    bar.appendChild(zoomBtn);
    bar.appendChild(closeBtn);

    var stage = document.createElement('div');
    stage.className = 'fleet-lightbox-stage';

    dialog.appendChild(bar);
    dialog.appendChild(stage);
    document.body.appendChild(dialog);

    var zoomed = false;
    var currentCtx = {};
    var currentTrigger = null;

    function setFit() {
      zoomed = false;
      stage.classList.remove('is-zoomed');
      zoomBtn.textContent = 'Zoom in';
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }

    function setZoom() {
      var content = stage.querySelector('.fleet-lightbox-clone');
      if (!content) { return; }
      zoomed = true;
      stage.classList.add('is-zoomed');
      zoomBtn.textContent = 'Fit';
      var svg = content.querySelector('svg');
      var vbW = svg && svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width;
      var baseWidth = vbW || content.getBoundingClientRect().width || 760;
      var target = Math.round(Math.max(window.innerWidth * 1.7, baseWidth));
      content.style.width = target + 'px';
    }

    function clearContentInline() {
      var content = stage.querySelector('.fleet-lightbox-clone');
      if (content) { content.style.width = ''; }
    }

    function open(sourceNode, ctx, trigger) {
      currentCtx = ctx || {};
      currentTrigger = trigger || null;
      stage.textContent = '';
      var clone = sourceNode.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.add('fleet-lightbox-clone');
      stage.appendChild(clone);
      setFit();
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    function close() {
      clearContentInline();
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
      stage.textContent = '';
      if (currentTrigger && typeof currentTrigger.focus === 'function') {
        currentTrigger.focus();
      }
      currentTrigger = null;
    }

    zoomBtn.addEventListener('click', function () {
      if (zoomed) { clearContentInline(); setFit(); } else { setZoom(); trackEvent('fleet_diagram_zoom', currentCtx); }
    });
    closeBtn.addEventListener('click', close);
    // Click on the dim backdrop area (the dialog element itself) closes.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) { close(); }
    });
    dialog.addEventListener('close', function () {
      clearContentInline();
      stage.textContent = '';
      // Native Escape closes the dialog without passing through close(), so
      // restore focus here as well as in the explicit close-button path.
      if (currentTrigger && typeof currentTrigger.focus === 'function') {
        currentTrigger.focus();
      }
      currentTrigger = null;
    });

    return { open: open };
  }

  function init() {
    var diagrams = Array.prototype.slice.call(document.querySelectorAll(DIAGRAM_SELECTOR));
    if (!diagrams.length) { return; }

    var lightbox = buildLightbox();

    diagrams.forEach(function (frame, i) {
      var svg = frame.querySelector('svg');
      var ctx = { diagram_index: i + 1, diagram_label: diagramLabel(frame, i + 1) };
      // Wrap the (horizontally scrolling) frame so the button can be pinned to
      // the corner without scrolling away with the diagram on mobile.
      var wrap = document.createElement('div');
      wrap.className = 'fleet-diagram-wrap';
      frame.parentNode.insertBefore(wrap, frame);
      wrap.appendChild(frame);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fleet-zoom-btn';
      btn.setAttribute('aria-label', 'Open diagram full screen');
      btn.textContent = '⛶ Full screen';
      btn.addEventListener('click', function () {
        trackEvent('fleet_diagram_fullscreen', ctx);
        lightbox.open(frame, ctx, btn);
      });
      wrap.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
