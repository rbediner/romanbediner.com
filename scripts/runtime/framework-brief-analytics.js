/*
 * Purpose:
 * - Emit lightweight GA4 interaction telemetry for framework brief pages.
 *
 * Architectural role:
 * - Tracks brief-page stage CTA transitions, framework diagram navigation clicks,
 *   and scroll depth milestones.
 *
 * Dependencies:
 * - Browser DOM APIs and GA bootstrap (`window.gtag`) when available.
 *
 * Security/CSP considerations:
 * - External script only; no inline handlers or inline script required.
 * - Fails silently when GA is unavailable.
 *
 * Migration considerations:
 * - Keep stage route prefixes synchronized with framework brief URL contracts.
 * - Preserve event names/parameters (`framework_stage_click`, `framework_nav_click`, `scroll_depth`) for GA continuity.
 */
(function initFrameworkBriefAnalytics() {
  var stageMap = {
    opportunity: 'opportunity',
    design: 'design',
    integration: 'integration',
    execution: 'execution',
    signals: 'signals',
    evolution: 'evolution'
  };

  function getStageFromPath(pathname) {
    var normalized = pathname || '';
    if (normalized.indexOf('/framework/opportunity/') === 0) return stageMap.opportunity;
    if (normalized.indexOf('/framework/design/') === 0) return stageMap.design;
    if (normalized.indexOf('/framework/integration/') === 0) return stageMap.integration;
    if (normalized.indexOf('/framework/execution/') === 0) return stageMap.execution;
    if (normalized.indexOf('/framework/signals/') === 0) return stageMap.signals;
    if (normalized.indexOf('/framework/evolution/') === 0) return stageMap.evolution;
    return null;
  }

  function safeTrack(eventName, params) {
    var environment = (window.__rbAnalytics && window.__rbAnalytics.environment) || 'unknown';
    var payload = Object.assign({}, params || {}, {
      environment: environment
    });

    if (window.__rbAnalytics && typeof window.__rbAnalytics.trackEvent === 'function') {
      window.__rbAnalytics.trackEvent(eventName, payload);
      return;
    }

    if (typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', eventName, payload);
  }

  function trackStageCtaClick(link) {
    var fromStage = getStageFromPath(window.location.pathname);
    var toStage = null;
    var targetPath = null;

    try {
      targetPath = new URL(link.href, window.location.origin).pathname;
      toStage = getStageFromPath(targetPath);
    } catch (error) {
      return;
    }

    if (!fromStage || !toStage) {
      return;
    }

    safeTrack('framework_stage_click', {
      source_page: window.location.pathname || '/',
      target_page: targetPath,
      link_type: 'framework',
      from_stage: fromStage,
      to_stage: toStage
    });
  }

  function trackFrameworkNavClick(link) {
    var targetStage = null;
    var targetPath = null;

    try {
      targetPath = new URL(link.href, window.location.origin).pathname;
      targetStage = getStageFromPath(targetPath);
    } catch (error) {
      return;
    }

    if (!targetStage) {
      return;
    }

    safeTrack('framework_nav_click', {
      source_page: window.location.pathname || '/',
      target_page: targetPath,
      link_type: 'framework',
      target_stage: targetStage
    });
  }

  function initScrollDepthTracking() {
    var thresholds = [25, 50, 75, 90];
    var fired = new Set();
    var ticking = false;

    function maxScrollableDistance() {
      var doc = document.documentElement;
      var body = document.body;
      var scrollHeight = Math.max(
        doc ? doc.scrollHeight : 0,
        body ? body.scrollHeight : 0
      );
      return Math.max(scrollHeight - window.innerHeight, 0);
    }

    function currentScrollPercent() {
      var maxScrollable = maxScrollableDistance();
      if (maxScrollable <= 0) {
        return 100;
      }
      return Math.min(
        100,
        Math.round((window.scrollY / maxScrollable) * 100)
      );
    }

    function emitThreshold(percent) {
      var path = window.location.pathname || '/';
      safeTrack('scroll_depth', {
        source_page: path,
        target_page: path,
        link_type: 'framework',
        page_path: path,
        page_type: 'framework_brief',
        scroll_percent: percent
      });
    }

    function evaluateThresholds() {
      var percent = currentScrollPercent();
      thresholds.forEach(function (threshold) {
        if (percent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          emitThreshold(threshold);
        }
      });
    }

    function scheduleEvaluation() {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        evaluateThresholds();
      });
    }

    evaluateThresholds();
    window.addEventListener('scroll', scheduleEvaluation, { passive: true });
    window.addEventListener('resize', scheduleEvaluation, { passive: true });
  }

  document.addEventListener('click', function (event) {
    var stageCta = event.target.closest('.next-page-nav .nav-anchor');
    if (stageCta) {
      trackStageCtaClick(stageCta);
      return;
    }

    var frameworkNavLink = event.target.closest('.framework-diagram .framework-progress-link');
    if (frameworkNavLink) {
      trackFrameworkNavClick(frameworkNavLink);
    }
  });

  initScrollDepthTracking();
})();
