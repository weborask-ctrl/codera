import { defineConfig, devices } from "@playwright/test"

/** A port of its own, so a dev server on :3000 is never mistaken for the build under test. */
const PORT = process.env.PLAYWRIGHT_PORT ?? "3100"
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

/**
 * Playwright configuration for the Webora app.
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  /* Fail the build on CI if a test.only was left in the source. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html"], ["github"]]
    : [["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  /**
   * Tests run against a production build, not `next dev`.
   *
   * Two reasons. It is the artefact users actually get — minified, no Strict
   * Mode double-invocation, no dev overlay. And the dev server watches the
   * repository root, so the `test-results/` and `playwright-report/` files
   * Playwright writes while the suite runs retrigger compilation and truncate
   * in-flight RSC streams, which surfaces as random hydration failures.
   */
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    /**
     * Never reused: an existing server on this port would be serving an older
     * build, so the suite would quietly pass against code that is not the code
     * under test.
     */
    reuseExistingServer: false,
    timeout: 240 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },
})
