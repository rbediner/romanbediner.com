/*
 * Purpose:
 * - Keep a page's in-page section anchors reachable from the first viewport.
 *   Surfaces a floating "On this page" control at page load, opening a sheet
 *   of the same section links with live active-section highlighting.
 *
 * Architectural role:
 * - Progressive enhancement for long editorial pages (About, Services). The
 *   inline chip nav (marked data-section-nav) and its target sections work with
 *   no JS; this script reads that nav and mirrors it into the floating control.
 *
 * Dependencies:
 * - Browser DOM APIs only (IntersectionObserver, no libraries, no inline handlers).
 *
 * Security/CSP considerations:
 * - External module loaded from 'self' (no inline script, no 'unsafe-inline').
 *   Builds DOM via createElement/textContent only; no innerHTML, no network.
 *
 * Migration considerations:
 * - Generic: any page with an element [data-section-nav] containing
 *   <a href="#id"> links gets the control. Safe no-op if that element or
 *   IntersectionObserver is absent.
 */
(function () {
  'use strict';

  function init() {
    var source = document.querySelector('[data-section-nav]');
    if (!source || typeof IntersectionObserver === 'undefined') { return; }

    var links = Array.prototype.slice.call(source.querySelectorAll('a[href^="#"]'));
    var items = links
      .map(function (a) {
        var id = (a.getAttribute('href') || '').slice(1);
        var target = id ? document.getElementById(id) : null;
        return target ? { id: id, label: a.textContent.trim(), target: target } : null;
      })
      .filter(Boolean);
    if (items.length < 2) { return; }

    // --- Build the floating control -------------------------------------
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'section-nav-fab';
    fab.setAttribute('aria-haspopup', 'true');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'On this page');

    var fabIcon = document.createElement('span');
    fabIcon.className = 'section-nav-fab-icon';
    fabIcon.setAttribute('aria-hidden', 'true');
    var fabText = document.createElement('span');
    fabText.className = 'section-nav-fab-text';
    fabText.textContent = 'On this page';
    fab.appendChild(fabIcon);
    fab.appendChild(fabText);

    var sheet = document.createElement('div');
    sheet.className = 'section-nav-sheet';
    sheet.setAttribute('role', 'navigation');
    sheet.setAttribute('aria-label', 'On this page');
    sheet.hidden = true;

    var heading = document.createElement('p');
    heading.className = 'section-nav-sheet-title';
    heading.textContent = 'On this page';
    sheet.appendChild(heading);

    var sheetLinks = {};
    items.forEach(function (it) {
      var link = document.createElement('a');
      link.href = '#' + it.id;
      link.className = 'section-nav-sheet-link';
      link.textContent = it.label;
      link.addEventListener('click', function () { closeSheet(); });
      sheet.appendChild(link);
      sheetLinks[it.id] = link;
    });

    document.body.appendChild(sheet);
    document.body.appendChild(fab);

    // --- Open / close ----------------------------------------------------
    var open = false;
    function openSheet() {
      open = true;
      sheet.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      // next frame so the transition runs from the hidden state
      requestAnimationFrame(function () { sheet.classList.add('is-open'); });
    }
    function closeSheet() {
      open = false;
      sheet.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      window.setTimeout(function () { if (!open) { sheet.hidden = true; } }, 200);
    }
    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      if (open) { closeSheet(); } else { openSheet(); }
    });
    document.addEventListener('click', function (e) {
      if (open && !sheet.contains(e.target) && e.target !== fab) { closeSheet(); }
    });
    document.addEventListener('keydown', function (e) {
      if (open && (e.key === 'Escape' || e.key === 'Esc')) { closeSheet(); fab.focus(); }
    });

    // --- Reveal immediately -----------------------------------------------
    // The control is intentionally available from page load on every viewport.
    // The source nav remains available in the document for progressive
    // enhancement and screen-reader navigation, while the floating control
    // gives readers an immediate orientation path.
    fab.classList.add('is-visible');

    // Some long-form resource pages intentionally put a primary download or
    // copy action in a contained artifact panel. On a phone, the fixed control
    // can otherwise cover that action at the exact moment a visitor is ready
    // to use it. A page can opt a panel into this protection without changing
    // the default behavior of the shared navigation elsewhere.
    var protectedRegions = Array.prototype.slice.call(document.querySelectorAll('[data-section-nav-protected]'));
    if (protectedRegions.length) {
      var protectedVisibility = new Map();
      var protectedObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          protectedVisibility.set(entry.target, entry.isIntersecting);
        });
        var shouldProtectActions = Array.from(protectedVisibility.values()).some(Boolean);
        fab.classList.toggle('is-contextually-hidden', shouldProtectActions);
        sheet.classList.toggle('is-contextually-hidden', shouldProtectActions);
        if (shouldProtectActions && open) { closeSheet(); }
      }, { threshold: 0.12 });
      protectedRegions.forEach(function (region) { protectedObserver.observe(region); });
    }

    // --- Active-section highlighting ------------------------------------
    var activeId = null;
    function setActive(id) {
      if (id === activeId) { return; }
      activeId = id;
      Object.keys(sheetLinks).forEach(function (key) {
        sheetLinks[key].classList.toggle('is-active', key === id);
      });
    }
    var activeObserver = new IntersectionObserver(function (entries) {
      // Choose the entry nearest the top that is currently intersecting.
      var visible = entries.filter(function (e) { return e.isIntersecting; });
      if (visible.length) {
        visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
        setActive(visible[0].target.id);
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    items.forEach(function (it) { activeObserver.observe(it.target); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
