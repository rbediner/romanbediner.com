/*
 * Purpose:
 * - Give each inline SVG architecture diagram (.fleet-diagram) a full-screen,
 *   zoomable lightbox so dense diagrams are legible on mobile where they would
 *   otherwise only scroll inside a small framed viewport.
 *
 * Architectural role:
 * - Progressive enhancement for /resources/agentic-ai-employees/. The diagrams
 *   render and scroll without JS; this script only adds an "Expand" affordance
 *   and a modal viewer with fit/zoom toggling on top of the existing markup.
 *
 * Dependencies:
 * - Browser DOM APIs only (native <dialog>, no libraries, no inline handlers).
 *   Clones the live inline <svg> so it keeps DM Sans and the brand palette.
 *
 * Security/CSP considerations:
 * - Loaded as an external module from 'self' (no inline script, no 'unsafe-inline').
 *   Creates DOM nodes programmatically and sets only style/class/text — no
 *   innerHTML from untrusted input, no network calls.
 *
 * Migration considerations:
 * - Generic over any .fleet-diagram on the page; if the diagram container class
 *   changes, update DIAGRAM_SELECTOR. Safe no-op on pages without diagrams.
 */
(function () {
  'use strict';

  var DIAGRAM_SELECTOR = '.fleet-diagram';

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

    function setFit() {
      zoomed = false;
      stage.classList.remove('is-zoomed');
      zoomBtn.textContent = 'Zoom in';
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }

    function setZoom() {
      var svg = stage.querySelector('svg');
      if (!svg) { return; }
      zoomed = true;
      stage.classList.add('is-zoomed');
      zoomBtn.textContent = 'Fit';
      var vbW = (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || 760;
      var target = Math.round(Math.max(window.innerWidth * 1.7, vbW));
      svg.style.width = target + 'px';
    }

    function clearSvgInline() {
      var svg = stage.querySelector('svg');
      if (svg) { svg.style.width = ''; }
    }

    function open(sourceSvg) {
      stage.textContent = '';
      var clone = sourceSvg.cloneNode(true);
      clone.removeAttribute('id');
      stage.appendChild(clone);
      setFit();
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    function close() {
      clearSvgInline();
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
      stage.textContent = '';
    }

    zoomBtn.addEventListener('click', function () {
      if (zoomed) { clearSvgInline(); setFit(); } else { setZoom(); }
    });
    closeBtn.addEventListener('click', close);
    // Click on the dim backdrop area (the dialog element itself) closes.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) { close(); }
    });
    dialog.addEventListener('close', function () { clearSvgInline(); stage.textContent = ''; });

    return { open: open };
  }

  function init() {
    var diagrams = Array.prototype.slice.call(document.querySelectorAll(DIAGRAM_SELECTOR));
    if (!diagrams.length) { return; }

    var lightbox = buildLightbox();

    diagrams.forEach(function (frame) {
      var svg = frame.querySelector('svg');
      if (!svg) { return; }
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
      btn.addEventListener('click', function () { lightbox.open(svg); });
      wrap.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
