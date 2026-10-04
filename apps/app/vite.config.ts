import { readdirSync } from "node:fs"
import { join } from "node:path"

import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { computeReadiness } from "@workspace/i18n/node"
import { defineConfig, loadEnv } from "vite"

import { parseEnv } from "./app/lib/env.schema.ts"

const LOCALES_DIR = join(import.meta.dirname, "app/locales")

// a locale ships only when every app namespace is complete, so no screen mixes languages
function readyLocales() {
  const namespaces = readdirSync(join(LOCALES_DIR, "en")).map((f) =>
    f.slice(0, -5)
  )
  return computeReadiness({
    localesDir: LOCALES_DIR,
    pages: { app: namespaces },
  }).get("app")
}

export default defineConfig(({ mode }) => {
  parseEnv(loadEnv(mode, import.meta.dirname, "VITE_"))

  return {
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), reactRouter()],
    define: { __APP_LOCALES__: JSON.stringify(readyLocales()) },
    server: { port: 5175 },
    // "localhost" races ::1 and times out on Windows
    preview: { host: "127.0.0.1" },
  }
})
