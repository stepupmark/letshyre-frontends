import { fileURLToPath } from "node:url"
import { ESLint } from "eslint"
import { beforeAll, describe, expect, it } from "vitest"
import { reactRouterApp } from "../src/react-router-app.js"

const cwd = fileURLToPath(new URL("./fixtures/app-project/", import.meta.url))
const WATCHED = /^(boundaries|better-tailwindcss|i18next|local)\//

let results

beforeAll(async () => {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: reactRouterApp({
      tsconfigRootDir: cwd,
      tailwindEntryPoint: `${cwd}theme.css`,
    }),
  })
  const files = await eslint.lintFiles(["app/**/*.{ts,tsx}"])
  results = Object.fromEntries(
    files.map((r) => [
      r.filePath.slice(cwd.length).replaceAll("\\", "/"),
      r.messages
        .filter((m) => WATCHED.test(m.ruleId ?? ""))
        .map((m) => `${m.line}:${m.ruleId}`),
    ])
  )
}, 120_000)

describe("feature boundaries", () => {
  it("lets app root, layouts and routes use a feature's public index", () => {
    expect(results["app/root.tsx"]).toEqual([])
    expect(results["app/layouts/site-layout.tsx"]).toEqual([])
  })

  it("blocks routes from reaching into feature internals", () => {
    expect(results["app/routes/pricing.tsx"]).toEqual([
      "2:boundaries/dependencies",
    ])
  })

  it("blocks one feature importing another", () => {
    expect(results["app/features/pricing/pricing-page.tsx"]).toEqual([
      "1:boundaries/dependencies",
    ])
  })

  it("blocks shared code importing features", () => {
    expect(results["app/lib/format.ts"]).toEqual(["1:boundaries/dependencies"])
  })
})

describe("styling and copy rules", () => {
  it("flags palette colors, physical spacing, class constants and literal text", () => {
    expect(results["app/features/pricing/components/plan-card.tsx"]).toEqual(
      expect.arrayContaining([
        "1:local/no-class-constants",
        "6:better-tailwindcss/no-restricted-classes",
        "6:better-tailwindcss/enforce-logical-properties",
        "6:i18next/no-literal-string",
        "7:i18next/no-literal-string",
      ])
    )
    expect(
      results["app/features/pricing/components/plan-card.tsx"].filter((m) =>
        m.endsWith("no-restricted-classes")
      )
    ).toHaveLength(2)
  })
})
