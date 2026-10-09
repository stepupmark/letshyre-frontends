import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["src/**"],
      exclude: ["src/cli.ts"],
      reporter: ["text-summary"],
      thresholds: { lines: 84, functions: 73, branches: 78 },
    },
  },
})
