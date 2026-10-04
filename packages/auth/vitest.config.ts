import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    coverage: {
      include: ["src/**"],
      exclude: ["src/react.ts"],
      reporter: ["text-summary"],
      thresholds: { lines: 90, functions: 90, branches: 75 },
    },
  },
})
