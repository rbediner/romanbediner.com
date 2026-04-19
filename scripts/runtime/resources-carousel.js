/*
 * Purpose:
 * - Provide a lightweight slide-image carousel for resource landing pages.
 *
 * Architectural role:
 * - Keeps the summary PDF preview interactive without embedding the raw PDF.
 *
 * Dependencies:
 * - Browser DOM APIs only.
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

    render();
  });
}());
