/*
 * Purpose:
 * - Keep a page's in-page section anchors reachable after the reader scrolls
 *   past the inline chip list. Surfaces a floating "On this page" control that
 *   appears once the source nav leaves the viewport, opening a sheet of the
 *   same section links with live active-section highlighting.
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

    // --- Show the control only after the inline nav scrolls away ---------
    var visObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fab.classList.remove('is-visible');
          if (open) { closeSheet(); }
        } else {
          fab.classList.add('is-visible');
        }
      });
    }, { rootMargin: '-12px 0px 0px 0px' });
    visObserver.observe(source);

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
