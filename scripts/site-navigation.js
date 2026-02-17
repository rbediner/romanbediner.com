// Shared mobile navigation toggle for all pages.
// Keeping this in an external file avoids CSP violations from inline script blocks.
(function initSiteNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const desktopNav = document.querySelector(".site-nav");

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

  // Normalize paths so active-state matching is stable with or without trailing slashes.
  const normalizePath = (pathname) => {
    if (pathname === "/") {
      return "/";
    }
    return pathname.endsWith("/") ? pathname : `${pathname}/`;
  };

  const activePath = normalizePath(window.location.pathname);
  [desktopNav, mobileNav].forEach((nav) => {
    if (!nav) {
      return;
    }
    nav.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("/")) {
        return;
      }
      if (normalizePath(href) === activePath) {
        link.classList.add("active");
      }
    });
  });
})();
