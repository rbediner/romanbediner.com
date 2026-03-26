/*
 * Purpose:
 * - Emit lightweight GA4 interaction telemetry for framework brief pages.
 *
 * Architectural role:
 * - Tracks brief-page stage CTA transitions and framework diagram navigation clicks.
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
 * - Preserve event names/parameters (`framework_stage_click`, `framework_nav_click`) for GA continuity.
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
    if (typeof window.gtag !== 'function') {
      return;
    }
    window.gtag('event', eventName, params);
  }

  function trackStageCtaClick(link) {
    var fromStage = getStageFromPath(window.location.pathname);
    var toStage = null;

    try {
      toStage = getStageFromPath(new URL(link.href, window.location.origin).pathname);
    } catch (error) {
      return;
    }

    if (!fromStage || !toStage) {
      return;
    }

    safeTrack('framework_stage_click', {
      from_stage: fromStage,
      to_stage: toStage
    });
  }

  function trackFrameworkNavClick(link) {
    var targetStage = null;

    try {
      targetStage = getStageFromPath(new URL(link.href, window.location.origin).pathname);
    } catch (error) {
      return;
    }

    if (!targetStage) {
      return;
    }

    safeTrack('framework_nav_click', {
      target_stage: targetStage
    });
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
})();
