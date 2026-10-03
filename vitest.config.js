import { defineConfig } from "vitest/config";
import path from "path";

// Deliberately standalone: vite.config.js loads the React Router plugin, which
// wants a route manifest and a build context these unit tests don't have.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve("app") },
  },
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{js,jsx}"],
    setupFiles: ["app/test/setup.js"],
    coverage: {
      provider: "v8",
      include: ["app/**/*.{js,jsx}"],
      exclude: ["app/**/*.test.{js,jsx}", "app/test/**", "app/i18n/messages/**"],
      // A ratchet, not a target: set to what the suite covers today so a
      // deleted test fails CI. Raise them as coverage grows; never lower them
      // to make a red run go green.
      thresholds: {
        statements: 5,
        branches: 3.9,
        functions: 4.5,
        lines: 4.8,
      },
    },
  },
});
