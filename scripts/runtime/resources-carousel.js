/*
 * Purpose:
 * - Provide a lightweight slide-image carousel for resource landing pages.
 * - Supports an Expand Preview lightbox for viewing individual slides at larger size.
 *
 * Architectural role:
 * - Keeps the summary PDF preview interactive without embedding the raw PDF.
 *
 * Dependencies:
 * - Browser DOM APIs only.
 * - window.__rbAnalytics (optional) for expand preview event tracking.
 *
 * Security/CSP considerations:
 * - External runtime only; no inline handlers.
 *
 * Migration considerations:
 * - Keep the carousel isolated so later resource pages can reuse it without coupling to framework-specific markup.
 */
(function initResourceCarousel() {
  const carousels = document.querySelectorAll('[data-resource-carousel]');
  if (!carousels.length) {
    return;
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

    // --- Expand Preview lightbox ---
    if (expandButton) {
      let modal = null;
      let modalImg = null;
      let modalCaption = null;

      function buildModal() {
        modal = document.createElement('div');
        modal.className = 'resource-preview-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Slide preview enlarged');

        const inner = document.createElement('div');
        inner.className = 'resource-preview-modal-inner';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'resource-preview-modal-close';
        closeBtn.setAttribute('aria-label', 'Close preview');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', closeModal);

        modalImg = document.createElement('img');
        modalImg.className = 'resource-preview-modal-img';

        modalCaption = document.createElement('p');
        modalCaption.className = 'resource-preview-modal-caption';

        inner.appendChild(closeBtn);
        inner.appendChild(modalImg);
        inner.appendChild(modalCaption);
        modal.appendChild(inner);
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal();
          }
        });
      }

      function openModal() {
        if (!modal) {
          buildModal();
        }
        const currentSlide = slides[activeIndex];
        const img = currentSlide.querySelector('img');
        if (img) {
          modalImg.src = img.src;
          modalImg.alt = img.alt;
        }
        modalCaption.textContent = `Slide ${activeIndex + 1} of ${slides.length}`;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
          modal.classList.add('is-open');
        });

        if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === 'function') {
          window.__rbAnalytics.trackEvent('resource_preview_expand', {
            source_page: window.location.pathname,
            slide_index: activeIndex + 1,
            slide_total: slides.length
          });
        }
      }

      function closeModal() {
        if (!modal) {
          return;
        }
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      expandButton.addEventListener('click', openModal);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
          closeModal();
        }
      });
    }

    render();
  });
}());
