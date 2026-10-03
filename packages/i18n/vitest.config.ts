import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**"],
      exclude: ["src/cli.ts"],
      reporter: ["text-summary"],
      thresholds: { lines: 90, functions: 90, branches: 85 },
    },
  },
})
