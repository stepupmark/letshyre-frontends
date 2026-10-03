import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      include: ["src/**"],
      reporter: ["text-summary"],
      thresholds: { lines: 90, functions: 90, branches: 85 },
    },
  },
})
