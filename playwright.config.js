// Playwright config scoped to spec-based browser checks.
// Jest `.test.js` files remain outside this runner.
const { defineConfig } = require("playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
});
