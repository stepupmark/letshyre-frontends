import { existsSync, readFileSync } from "node:fs"

import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"

import { parseNginxMap } from "../../tooling/csp.ts"
import { parseEnv } from "./app/lib/env.schema.ts"

const CSP_MAP = new URL("build/csp.map", import.meta.url)

// preview enforces the policy postbuild wrote, so e2e catches anything it would block
const previewHeaders = (): Record<string, string> =>
  existsSync(CSP_MAP)
    ? {
        "Content-Security-Policy": parseNginxMap(readFileSync(CSP_MAP, "utf8"))
          .fallback,
      }
    : {}

export default defineConfig(({ command, mode }) => {
  parseEnv(loadEnv(mode, import.meta.dirname, "VITE_"), {
    production: command === "build" && mode === "production",
  })

  return {
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), reactRouter()],
    server: { port: 5176 },
    // "localhost" races ::1 and times out on Windows
    preview: { host: "127.0.0.1", headers: previewHeaders() },
  }
})
