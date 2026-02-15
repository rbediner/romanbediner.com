// Shared mobile navigation toggle for all pages.
// Keeping this in an external file avoids CSP violations from inline script blocks.
(function initSiteNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (!menuToggle || !mobileNav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
})();
