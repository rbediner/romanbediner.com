// Initialize expand and collapse behavior for Insights cards.
function bindInsightToggle(button) {
  const card = button.closest('.insight-card');
  if (!card) {
    return;
  }

  const titleNode = card.querySelector('h2');
  const insightTitle = titleNode ? titleNode.textContent.trim() : '';
  const insightSlug = card.id || '';

  button.addEventListener('click', () => {
    const isExpanded = !card.classList.contains('expanded');

    // Toggle card state and button accessibility state in one place.
    card.classList.toggle('expanded', isExpanded);
    button.setAttribute('aria-expanded', String(isExpanded));
    button.textContent = isExpanded ? 'Collapse -' : 'Expand +';

    // Fire analytics only on expansion, and fail safely if GA is unavailable.
    if (isExpanded && typeof gtag === 'function') {
      gtag('event', 'insight_expand', {
        insight_slug: insightSlug,
        insight_title: insightTitle
      });
    }
  });
}

// Bind all toggles on initial page load.
function initializeInsightToggles(rootDocument) {
  const context = rootDocument || document;
  const toggles = context.querySelectorAll('.insight-toggle');
  toggles.forEach((button) => bindInsightToggle(button));
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeInsightToggles(document);
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    bindInsightToggle,
    initializeInsightToggles
  };
}
