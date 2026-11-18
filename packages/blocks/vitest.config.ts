import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
    coverage: {
      include: ["src/**"],
      exclude: ["src/logo.tsx", "src/assets/**"],
      reporter: ["text-summary"],
      thresholds: { lines: 85, functions: 80, branches: 72 },
    },
  },
})
