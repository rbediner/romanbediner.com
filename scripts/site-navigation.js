/*
 * Purpose:
 * - Render and manage shared header navigation across canonical pages.
 *
 * Architectural role:
 * - Single source of truth for nav links and active-route behavior in static HTML pages.
 *
 * Dependencies:
 * - Browser DOM APIs and canonical route map defined in this file.
 *
 * Security/CSP considerations:
 * - Keeps nav behavior external to markup to avoid inline scripts and handlers.
 * - Optional GA click telemetry fails silently when GA runtime is unavailable.
 *
 * Migration considerations:
 * - Update route normalization and link map if canonical URL scheme changes on new hosts.
 */
// Shared global navigation model used by all pages.
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
  { label: "Services", href: "/services/" },
  { label: "Insights", href: "/insights/" },
  { label: "Connect", href: "/connect/" }
];

// Normalize paths so active-state matching is stable with or without trailing slashes.
function normalizePath(pathname) {
  if (pathname === "/") {
    return "/";
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

// Render a nav using the shared NAV_LINKS list to prevent per-page drift.
function renderSharedNav(navElement) {
  if (!navElement) {
    return;
  }
  navElement.innerHTML = NAV_LINKS.map((link) => `<a href="${link.href}">${link.label}</a>`).join("");
}

// Emit lightweight nav telemetry on Home without breaking pages where GA is unavailable.
function trackHeaderNavClick(label) {
  if (normalizePath(window.location.pathname) !== "/") {
    return;
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", "nav_click", {
      label,
      location: "header"
    });
  }
}

// Attach nav click tracking to a rendered nav element.
function bindHeaderNavTracking(navElement) {
  if (!navElement) {
    return;
  }
  navElement.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      const label = (link.textContent || "").trim();
      trackHeaderNavClick(label);
    });
  });
}

// Apply active styling to whichever link matches the current route.
function applyActiveNavState(navElement, activePath) {
  if (!navElement) {
    return;
  }
  navElement.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && normalizePath(href) === activePath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

// Shared mobile navigation toggle for all pages.
// Keeping this in an external file avoids CSP violations from inline script blocks.
(function initSiteNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const desktopNav = document.querySelector(".site-nav");

  renderSharedNav(desktopNav);
  renderSharedNav(mobileNav);
  bindHeaderNavTracking(desktopNav);
  bindHeaderNavTracking(mobileNav);

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

  const activePath = normalizePath(window.location.pathname);
  applyActiveNavState(desktopNav, activePath);
  applyActiveNavState(mobileNav, activePath);
})();

(function syncAboutTimelineOrbs() {
  function positionTimeline() {
    const wrapper = document.querySelector(".arc-timeline-wrapper");
    if (!wrapper) return;

    const sections = wrapper.querySelectorAll(".arc-item");
    const orbs = wrapper.querySelectorAll(".timeline-orb");

    if (sections.length !== 3 || orbs.length !== 3) return;

    const wrapperRect = wrapper.getBoundingClientRect();

    sections.forEach((section, index) => {
      const narrative = section.querySelector(".arc-narrative");
      if (!narrative) return;

      const rect = narrative.getBoundingClientRect();
      const visualCenter = rect.top + rect.height / 2 - wrapperRect.top;
      orbs[index].style.top = `${visualCenter}px`;
    });
  }

  function schedule() {
    positionTimeline();
    setTimeout(positionTimeline, 60);
    setTimeout(positionTimeline, 160);
  }

  document.addEventListener("DOMContentLoaded", schedule);

  window.addEventListener("resize", function () {
    clearTimeout(window.__timeline);
    window.__timeline = setTimeout(schedule, 100);
  });
})();
