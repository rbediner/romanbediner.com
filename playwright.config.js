// Playwright config scoped to spec-based browser checks.
// Jest `.test.js` files remain outside this runner.
const { defineConfig } = require("playwright/test");

module.exports = defineConfig({
  // Playwright specs are isolated from Jest under QA/tests/playwright.
  testDir: "./QA/tests/playwright",
  testMatch: "**/*.spec.js",
  // Keep all Playwright runtime artifacts under QA/results to avoid root-level test-results folders.
  outputDir: "QA/results/playwright",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
});
