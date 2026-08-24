/*
 * Purpose:
 * - Copy the canonical Agent Builder Starter Prompt Markdown file directly
 *   from the page, without duplicating the long build contract in HTML.
 *
 * Architectural role:
 * - Progressive enhancement for the Agentic AI Employees resource and the
 *   Resources hub. The downloadable Markdown file remains usable without JS.
 *
 * Dependencies:
 * - Browser Fetch and Clipboard APIs only; no libraries or inline handlers.
 *
 * Security/CSP considerations:
 * - fetches a same-origin, static text asset only. The fetched text is copied
 *   as plain text and is never interpreted as HTML or executable content.
 *
 * Migration considerations:
 * - Buttons declare data-copy-resource with the canonical relative asset path.
 *   If the asset cannot be copied, the button explains the fallback download.
 */
(function initAgentBuilderStarterPromptCopy() {
  'use strict';

  function setTemporaryButtonLabel(button, label) {
    var original = button.textContent;
    button.textContent = label;
    window.setTimeout(function restoreButtonLabel() {
      button.textContent = original;
    }, 1800);
  }

  document.querySelectorAll('[data-copy-resource]').forEach(function bindCopyButton(button) {
    button.addEventListener('click', async function copyResource() {
      var resourcePath = button.getAttribute('data-copy-resource');
      if (!resourcePath || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        setTemporaryButtonLabel(button, 'Download the prompt instead');
        return;
      }

      try {
        var response = await window.fetch(resourcePath, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Starter prompt fetch failed');
        await navigator.clipboard.writeText(await response.text());
        setTemporaryButtonLabel(button, 'Copied the starter prompt');
      } catch (error) {
        setTemporaryButtonLabel(button, 'Download the prompt instead');
      }
    });
  });
}());
