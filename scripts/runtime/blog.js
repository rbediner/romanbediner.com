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
  let opener;
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
      dialog.showModal();
    });
  });
  if (dialog) dialog.addEventListener('close', () => { if (opener) opener.focus(); });
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
