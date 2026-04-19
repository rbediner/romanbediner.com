/*
 * Purpose:
 * - Provide a lightweight slide-image carousel for resource landing pages.
 * - Supports a materially larger Expand Preview modal with full keyboard and
 *   focus management, previous/next navigation, visible close icon, and
 *   Escape / outside-click / close-button closure paths.
 *
 * Architectural role:
 * - Keeps the summary PDF preview interactive without embedding the raw PDF.
 *
 * Dependencies:
 * - Browser DOM APIs only.
 * - window.__rbAnalytics (optional) for resource_preview_expand tracking.
 *
 * Security/CSP considerations:
 * - External runtime only; no inline handlers.
 *
 * Accessibility:
 * - Modal is a role="dialog" with aria-modal="true" and aria-label.
 * - Focus moves into the modal on open and returns to the triggering element
 *   on close; focus is trapped via Tab/Shift+Tab while open.
 * - ArrowLeft / ArrowRight navigate slides while modal is open.
 * - Escape, outside click, and close button all dismiss the modal.
 *
 * Migration considerations:
 * - Keep the carousel isolated so later resource pages can reuse it without
 *   coupling to framework-specific markup. To reuse on a new resource route,
 *   render a [data-resource-carousel] shell with the same data-carousel-*
 *   hooks and expose data-resource-slug/title/type/location on a containing
 *   element so the analytics payload remains PRD-compliant.
 */
(function initResourceCarousel() {
  const carousels = document.querySelectorAll('[data-resource-carousel]');
  if (!carousels.length) {
    return;
  }

  function readResourceContext(root) {
    const scope = root.closest('[data-resource-slug]') || document.querySelector('main[data-resource-slug]');
    if (!scope) {
      return {};
    }
    return {
      resource_slug: scope.getAttribute('data-resource-slug') || '',
      resource_title: scope.getAttribute('data-resource-title') || '',
      resource_type: scope.getAttribute('data-resource-type') || '',
      resource_location: scope.getAttribute('data-resource-location') || ''
    };
  }

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
    const previousButton = carousel.querySelector('[data-carousel-previous]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const expandButton = carousel.querySelector('[data-carousel-expand]');
    const counter = carousel.querySelector('[data-carousel-count]');
    let activeIndex = 0;

    if (!track || slides.length < 2 || !previousButton || !nextButton || !counter) {
      return;
    }

    function render() {
      track.style.transform = `translateX(-${activeIndex * 100}%)`;
      previousButton.disabled = activeIndex === 0;
      nextButton.disabled = activeIndex === slides.length - 1;
      counter.textContent = `Slide ${activeIndex + 1} of ${slides.length}`;
      if (modal && modal.classList.contains('is-open')) {
        updateModalSlide();
      }
    }

    previousButton.addEventListener('click', () => {
      if (activeIndex === 0) {
        return;
      }
      activeIndex -= 1;
      render();
    });

    nextButton.addEventListener('click', () => {
      if (activeIndex === slides.length - 1) {
        return;
      }
      activeIndex += 1;
      render();
    });

    // --- Expand Preview modal ---
    let modal = null;
    let modalImg = null;
    let modalCaption = null;
    let modalPrev = null;
    let modalNext = null;
    let modalClose = null;
    let lastFocusedTrigger = null;

    function buildModal() {
      modal = document.createElement('div');
      modal.className = 'resource-preview-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Framework summary slide preview');
      modal.setAttribute('tabindex', '-1');

      const inner = document.createElement('div');
      inner.className = 'resource-preview-modal-inner';

      modalClose = document.createElement('button');
      modalClose.type = 'button';
      modalClose.className = 'resource-preview-modal-close';
      modalClose.setAttribute('aria-label', 'Close slide preview');
      modalClose.innerHTML = '<span aria-hidden="true">&times;</span>';
      modalClose.addEventListener('click', closeModal);

      const stage = document.createElement('div');
      stage.className = 'resource-preview-modal-stage';

      modalPrev = document.createElement('button');
      modalPrev.type = 'button';
      modalPrev.className = 'resource-preview-modal-nav resource-preview-modal-prev';
      modalPrev.setAttribute('aria-label', 'Previous slide');
      modalPrev.innerHTML = '<span aria-hidden="true">&larr;</span>';
      modalPrev.addEventListener('click', () => {
        if (activeIndex > 0) {
          activeIndex -= 1;
          render();
        }
      });

      modalNext = document.createElement('button');
      modalNext.type = 'button';
      modalNext.className = 'resource-preview-modal-nav resource-preview-modal-next';
      modalNext.setAttribute('aria-label', 'Next slide');
      modalNext.innerHTML = '<span aria-hidden="true">&rarr;</span>';
      modalNext.addEventListener('click', () => {
        if (activeIndex < slides.length - 1) {
          activeIndex += 1;
          render();
        }
      });

      modalImg = document.createElement('img');
      modalImg.className = 'resource-preview-modal-img';

      stage.appendChild(modalPrev);
      stage.appendChild(modalImg);
      stage.appendChild(modalNext);

      modalCaption = document.createElement('p');
      modalCaption.className = 'resource-preview-modal-caption';

      inner.appendChild(modalClose);
      inner.appendChild(stage);
      inner.appendChild(modalCaption);
      modal.appendChild(inner);
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    function updateModalSlide() {
      const currentSlide = slides[activeIndex];
      const img = currentSlide.querySelector('img');
      if (img && modalImg) {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
      }
      if (modalCaption) {
        modalCaption.textContent = `Slide ${activeIndex + 1} of ${slides.length}`;
      }
      if (modalPrev) {
        modalPrev.disabled = activeIndex === 0;
      }
      if (modalNext) {
        modalNext.disabled = activeIndex === slides.length - 1;
      }
    }

    function focusableModalElements() {
      if (!modal) {
        return [];
      }
      return Array.from(
        modal.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
      );
    }

    function onDocumentKeydown(e) {
      if (!modal || !modal.classList.contains('is-open')) {
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === 'ArrowRight' && activeIndex < slides.length - 1) {
        e.preventDefault();
        activeIndex += 1;
        render();
        return;
      }
      if (e.key === 'ArrowLeft' && activeIndex > 0) {
        e.preventDefault();
        activeIndex -= 1;
        render();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = focusableModalElements();
        if (!focusables.length) {
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;
        if (e.shiftKey && current === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function openModal() {
      if (!modal) {
        buildModal();
      }
      lastFocusedTrigger = document.activeElement;
      updateModalSlide();
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        modal.classList.add('is-open');
        if (modalClose && typeof modalClose.focus === 'function') {
          modalClose.focus();
        }
      });

      if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === 'function') {
        const ctx = readResourceContext(carousel);
        window.__rbAnalytics.trackEvent('resource_preview_expand', Object.assign({}, ctx, {
          slide_index: activeIndex + 1
        }));
      }
    }

    function closeModal() {
      if (!modal) {
        return;
      }
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
        lastFocusedTrigger.focus();
      }
    }

    if (expandButton) {
      expandButton.addEventListener('click', openModal);
      document.addEventListener('keydown', onDocumentKeydown);
    }

    render();
  });
}());
