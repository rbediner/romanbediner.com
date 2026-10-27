/*
 * Purpose:
 * - Expand readable diagrams and measure production-only partner intent.
 * Architectural role:
 * - Progressive enhancement for static, accessible editorial pages.
 * Dependencies:
 * - Browser dialog API and optional shared analytics runtime.
 * Security/CSP considerations:
 * - No inline handlers or third-party code; no personal data or URL query values.
 * Migration considerations:
 * - Preserve partner_click as outbound intent, never equate it with a signup.
 */
(function () {
  const dialog = document.querySelector('.blog-diagram-dialog');
  const viewport = dialog && dialog.querySelector('.blog-diagram-expanded');
  const pointers = new Map();
  let scale = 1, x = 0, y = 0, previousGesture, bodyOverflow;
  let opener;

  // Keep zoom anchored beneath the fingers and constrain panning to the viewer.
  function render() {
    if (!viewport || !viewport.firstElementChild) return;
    const bounds = viewport.getBoundingClientRect();
    const maxX = bounds.width * (scale - 1) / 2;
    const maxY = bounds.height * (scale - 1) / 2;
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    viewport.firstElementChild.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    dialog.querySelector('output').textContent = `${Math.round(scale * 100)}%`;
  }
  function zoom(next, anchor = { x: 0, y: 0 }) {
    const clamped = Math.max(1, Math.min(5, next));
    const ratio = clamped / scale;
    x = anchor.x - (anchor.x - x) * ratio;
    y = anchor.y - (anchor.y - y) * ratio;
    scale = clamped;
    render();
  }
  function gesture() {
    const points = Array.from(pointers.values());
    if (!points.length) return null;
    if (points.length === 1) return { ...points[0], distance: 0 };
    return {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
      distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
    };
  }
  if (viewport) {
    // Pointer capture keeps a two-finger pinch stable at the viewport edges.
    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      viewport.setPointerCapture(event.pointerId);
      previousGesture = gesture();
    });
    viewport.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const current = gesture();
      if (previousGesture && current) {
        if (current.distance && previousGesture.distance) {
          const bounds = viewport.getBoundingClientRect();
          zoom(scale * current.distance / previousGesture.distance, {
            x: previousGesture.x - bounds.left - bounds.width / 2,
            y: previousGesture.y - bounds.top - bounds.height / 2
          });
        }
        x += current.x - previousGesture.x;
        y += current.y - previousGesture.y;
        render();
      }
      previousGesture = current;
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
      viewport.addEventListener(type, event => {
        pointers.delete(event.pointerId);
        previousGesture = gesture();
      });
    });
    // Equivalent keyboard controls keep touch gestures optional.
    viewport.addEventListener('keydown', event => {
      if (['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        if (event.key === '+' || event.key === '=') zoom(scale * 1.5);
        else if (event.key === '-') zoom(scale / 1.5);
        else if (event.key === '0') zoom(1);
        else {
          x += event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0;
          y += event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0;
          render();
        }
      }
    });
    dialog.querySelectorAll('[data-diagram-zoom]').forEach(button => {
      button.addEventListener('click', () => zoom(button.dataset.diagramZoom === 'fit' ? 1 : scale * (button.dataset.diagramZoom === 'in' ? 1.5 : 1 / 1.5)));
    });
    window.addEventListener('resize', render);
  }
  document.querySelectorAll('[data-expand-diagram]').forEach(button => {
    button.addEventListener('click', () => {
      const source = button.closest('figure').querySelector('svg, img');
      if (!dialog || typeof dialog.showModal !== 'function') { window.open(button.dataset.diagramSrc || source.src, '_blank', 'noopener'); return; }
      const target = dialog.querySelector('.blog-diagram-expanded');
      const expanded = source.cloneNode(true);
      // Keep document IDs unique while the original and expanded SVG coexist.
      expanded.querySelectorAll('[id]').forEach(node => {
        const id = node.id;
        node.id = `${id}-expanded`;
        expanded.querySelectorAll('*').forEach(element => {
          for (const attribute of Array.from(element.attributes)) {
            if (attribute.value.includes(`url(#${id})`)) element.setAttribute(attribute.name, attribute.value.replaceAll(`url(#${id})`, `url(#${id}-expanded)`));
          }
        });
      });
      target.replaceChildren(expanded);
      opener = button;
      pointers.clear(); previousGesture = null;
      scale = 1; x = 0; y = 0;
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      render();
    });
  });
  if (dialog) dialog.addEventListener('close', () => {
    pointers.clear(); previousGesture = null;
    document.body.style.overflow = bodyOverflow;
    if (opener) opener.focus();
  });
  document.querySelectorAll('[data-partner-cta], [data-blog-contact]').forEach(link => {
    link.addEventListener('click', () => {
      const analytics = window.__rbAnalytics;
      if (window.location.hostname !== 'romanbediner.com' || !analytics || analytics.environment !== 'production') return;
      analytics.trackEvent(link.hasAttribute('data-partner-cta') ? 'partner_click' : 'blog_contact_intent', {
        article_slug: link.dataset.article || window.location.pathname.split('/').filter(Boolean).pop(),
        cta_position: link.dataset.partnerCta || link.dataset.blogContact,
        partner: 'agentic_society'
      });
    });
  });
})();
