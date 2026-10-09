import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
    coverage: {
      include: ["src/**"],
      reporter: ["text-summary"],
      thresholds: { lines: 88, functions: 90, branches: 80 },
    },
  },
})
