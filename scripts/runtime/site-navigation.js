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
  { label: "Framework", href: "/framework/" },
  { label: "Resources", href: "/resources/" },
  { label: "Services", href: "/services/" },
  { label: "Connect", href: "/connect/" }
];

// Normalize paths so active-state matching is stable with or without trailing slashes.
function normalizePath(pathname) {
  if (pathname === "/") {
    return "/";
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

// Resolve project-pages base path so preview links stay inside /<repo-name>/.
function resolveBasePath() {
  if (!window.location.hostname.endsWith("github.io")) {
    return "";
  }
  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0];
  return firstSegment ? `/${firstSegment}` : "";
}

// Prefix canonical route hrefs with base path when running on project pages previews.
function resolveNavHref(href, basePath) {
  if (!basePath || !href) {
    return href;
  }
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith(`${basePath}/`)) {
    return href;
  }
  if (href === "/") {
    return `${basePath}/`;
  }
  return `${basePath}${href}`;
}

// Render a nav using the shared NAV_LINKS list to prevent per-page drift.
function renderSharedNav(navElement) {
  if (!navElement) {
    return;
  }
  const basePath = resolveBasePath();
  navElement.innerHTML = NAV_LINKS.map((link) => {
    const resolvedHref = resolveNavHref(link.href, basePath);
    return `<a href="${resolvedHref}">${link.label}</a>`;
  }).join("");
}

// Resolve the canonical nav destination that should be marked active for a route.
function resolveActiveNavHref(activePath) {
  if (activePath === "/") {
    return "/";
  }

  const parentMatch = NAV_LINKS.find((link) => (
    link.href !== "/" && activePath.startsWith(link.href)
  ));

  return parentMatch ? parentMatch.href : activePath;
}

function resolveEnvironment() {
  if (window.__rbAnalytics && typeof window.__rbAnalytics.environment === "string") {
    return window.__rbAnalytics.environment;
  }

  var hostname = window.location.hostname || "";
  var pathname = window.location.pathname || "";
  if (hostname === "romanbediner.com") {
    return "production";
  }
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "local";
  }
  if (hostname === "rbediner.github.io" && pathname.startsWith("/romanbediner-preview")) {
    return "preview";
  }
  return "unknown";
}

function trackEvent(eventName, params) {
  if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === "function") {
    window.__rbAnalytics.trackEvent(eventName, params || {});
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, Object.assign({}, params || {}, {
      environment: resolveEnvironment()
    }));
  }
}

function resolveEventTargetPath(link) {
  try {
    var parsed = new URL(link.href, window.location.origin);
    var path = parsed.pathname || "/";
    return parsed.hash ? path + parsed.hash : path;
  } catch (error) {
    return null;
  }
}

function isInternalLink(link) {
  if (!link || !link.href) {
    return false;
  }

  try {
    var parsed = new URL(link.href, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch (error) {
    return false;
  }
}

function resolveSourceFromReferrer() {
  try {
    if (!document.referrer) {
      return "(direct)";
    }
    var ref = new URL(document.referrer);
    if (ref.origin !== window.location.origin) {
      return "(direct)";
    }
    return ref.pathname || "/";
  } catch (error) {
    return "(direct)";
  }
}

function trackConnectIntentNavigation() {
  var currentPath = normalizePath(window.location.pathname || "/");
  if (currentPath !== "/connect/") {
    return;
  }

  var sourcePage = resolveSourceFromReferrer();
  trackEvent("connect_intent", {
    source_page: sourcePage,
    target_page: "/connect/",
    link_type: "internal_navigation",
    trigger_type: "internal_navigation",
    destination: "/connect/"
  });
}

function bindGlobalLinkTracking() {
  document.addEventListener("click", (event) => {
    var link = event.target.closest("a[href]");
    if (!link) {
      return;
    }

    if (!isInternalLink(link)) {
      var href = (link.getAttribute("href") || "").toLowerCase();
      var absolute = (link.href || "").toLowerCase();
      if (href.includes("linkedin.com/in/romanbediner") || absolute.includes("linkedin.com/in/romanbediner")) {
        var sourcePage = window.location.pathname || "/";
        trackEvent("connect_intent", {
          source_page: sourcePage,
          target_page: "linkedin",
          link_type: "external_link",
          trigger_type: "external_link",
          destination: "linkedin"
        });
      }
      return;
    }

    var targetPath = resolveEventTargetPath(link);
    if (!targetPath) {
      return;
    }

    var sourcePage = window.location.pathname || "/";
    var label = (link.textContent || "").trim();
    var baseParams = {
      source_page: sourcePage,
      target_page: targetPath,
      environment: resolveEnvironment()
    };

    if (link.closest(".site-nav") || link.closest("#mobile-nav")) {
      trackEvent("nav_click", Object.assign({}, baseParams, {
        label: label,
        link_type: "header",
        location: "header"
      }));
      return;
    }

    if (link.closest("footer") || link.closest(".footer")) {
      trackEvent("nav_click", Object.assign({}, baseParams, {
        label: label,
        link_type: "footer",
        location: "footer"
      }));
      return;
    }

    var frameworkContext = link.closest(".framework-diagram, .framework-progress, .framework-stage-list");
    trackEvent("internal_link_click", Object.assign({}, baseParams, {
      link_type: frameworkContext ? "framework" : "in-content"
    }));
  });
}

// Apply active styling to whichever link matches the current route.
function applyActiveNavState(navElement, activePath) {
  if (!navElement) {
    return;
  }
  const activeHref = resolveActiveNavHref(activePath);
  navElement.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && normalizePath(href) === activeHref) {
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
  bindGlobalLinkTracking();
  trackConnectIntentNavigation();

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
