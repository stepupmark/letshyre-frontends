import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { computeReadiness } from "@workspace/i18n/node"
import { defineConfig, loadEnv, type Plugin } from "vite"

import { parseEnv } from "./app/lib/env.schema.ts"

const LOCALES_DIR = join(import.meta.dirname, "app/locales")

// a locale ships only when every app namespace is complete, so no screen mixes
// languages, and a native speaker has reviewed it; I18N_PREVIEW=1 skips the review
// so reviewers can see their locale on staging
function readyLocales() {
  const namespaces = readdirSync(join(LOCALES_DIR, "en")).map((f) =>
    f.slice(0, -5)
  )
  const complete =
    computeReadiness({
      localesDir: LOCALES_DIR,
      pages: { app: namespaces },
    }).get("app") ?? []
  if (process.env.I18N_PREVIEW === "1") return complete
  const reviewed = JSON.parse(
    readFileSync(join(LOCALES_DIR, "reviewed.json"), "utf8")
  ) as string[]
  return complete.filter((locale) => reviewed.includes(locale))
}

// like import.meta.glob over the locales, but only the ones that ship, so
// unreviewed catalogs stay out of the build and the loader map stays small
function catalogs(locales: string[]): Plugin {
  const id = "virtual:app-catalogs"
  return {
    name: "app-catalogs",
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(resolved) {
      if (resolved !== `\0${id}`) return
      const entries = locales.flatMap((locale) =>
        readdirSync(join(LOCALES_DIR, locale))
          .filter((file) => file.endsWith(".json"))
          .map((file) => {
            const path = join(LOCALES_DIR, locale, file).replaceAll("\\", "/")
            return `"${locale}/${file}": () => import(${JSON.stringify(path)}).then((m) => m.default)`
          })
      )
      return `export default {${entries.join(",")}}`
    },
  }
}

export default defineConfig(({ mode }) => {
  parseEnv(loadEnv(mode, import.meta.dirname, "VITE_"))
  const locales = readyLocales()

  return {
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), reactRouter(), catalogs(locales)],
    define: { __APP_LOCALES__: JSON.stringify(locales) },
    server: { port: 5175 },
    // "localhost" races ::1 and times out on Windows
    preview: { host: "127.0.0.1" },
  }
})
