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
// Home is accessible via the logo; Connect is a CTA button rendered separately.
const NAV_LINKS = [
  { label: "About", href: "/about/" },
  { label: "Framework", href: "/framework/" },
  { label: "Resources", href: "/resources/" },
  { label: "Services", href: "/services/" },
  { label: "Connect", href: "/connect/", cta: true }
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
// Links with cta:true are rendered as accent buttons (Connect).
function renderSharedNav(navElement) {
  if (!navElement) {
    return;
  }
  const basePath = resolveBasePath();
  navElement.innerHTML = NAV_LINKS.map((link) => {
    const resolvedHref = resolveNavHref(link.href, basePath);
    if (link.cta) {
      return `<a href="${resolvedHref}" class="nav-cta">${link.label} &rarr;</a>`;
    }
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

// Scroll-depth telemetry: emit a `scroll_depth` event at 25/50/75/100% reached
// (once each per page load), with { percent_scrolled, page_path }. Complements GA4
// enhanced measurement's single 90% scroll event with the granularity needed to see
// how far readers actually get on long pages (briefs, About, the agentic page).
(function initScrollDepthTracking() {
  const thresholds = [25, 50, 75, 100];
  const fired = {};
  let ticking = false;

  function maxScrollPercent() {
    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = window.pageYOffset || doc.scrollTop || 0;
    const viewport = window.innerHeight || doc.clientHeight || 0;
    const full = Math.max(
      doc.scrollHeight,
      doc.offsetHeight,
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0
    );
    if (full <= viewport) {
      return 100;
    }
    return Math.min(100, Math.round(((scrollTop + viewport) / full) * 100));
  }

  function evaluate() {
    ticking = false;
    const pct = maxScrollPercent();
    thresholds.forEach((t) => {
      if (pct >= t && !fired[t]) {
        fired[t] = true;
        trackEvent("scroll_depth", {
          percent_scrolled: t,
          page_path: window.location.pathname
        });
      }
    });
    if (fired[100]) {
      window.removeEventListener("scroll", onScroll);
    }
  }

  function onScroll() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(evaluate);
  }

  function start() {
    window.addEventListener("scroll", onScroll, { passive: true });
    // Evaluate once for already-scrolled loads or pages shorter than the viewport.
    evaluate();
  }

  // site-navigation.js runs before the deferred ga4-bootstrap.js, so
  // window.__rbAnalytics may not exist yet when this IIFE executes. Defer the
  // scroll-depth start until analytics is ready; otherwise the initial evaluate()
  // would mark already-visible thresholds as fired while trackEvent() is still a
  // no-op, permanently losing those events (notably every threshold on short pages).
  if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === "function") {
    start();
  } else {
    window.addEventListener("load", start, { once: true });
  }
})();

(function syncAboutTimelineOrbs() {
  function positionTimeline() {
    const wrapper = document.querySelector(".arc-timeline-wrapper");
    if (!wrapper) return;

    const sections = wrapper.querySelectorAll(".arc-item");
    const orbs = wrapper.querySelectorAll(".timeline-orb");

    if (sections.length === 0 || sections.length !== orbs.length) return;

    const wrapperRect = wrapper.getBoundingClientRect();

    sections.forEach((section, index) => {
      const narrative = section.querySelector(".arc-narrative");
      if (!narrative) return;

      const rect = narrative.getBoundingClientRect();
      const visualCenter = rect.top + rect.height / 2 - wrapperRect.top;
      if (orbs[index]) {
        orbs[index].style.top = `${visualCenter}px`;
      }
    });
  }

  function schedule() {
    positionTimeline();
    setTimeout(positionTimeline, 60);
    setTimeout(positionTimeline, 160);
  }

  document.addEventListener("DOMContentLoaded", schedule);
  // Re-position after web fonts load; DM Sans/Cormorant Garamond reflow changes arc-narrative heights.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(positionTimeline);
  }

  window.addEventListener("resize", function () {
    clearTimeout(window.__timeline);
    window.__timeline = setTimeout(schedule, 100);
  });
})();
