import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  checkAll,
  computeReadiness,
  readCatalogs,
  readinessFrom,
} from "../src/node/readiness.ts"

const localesDir = fileURLToPath(new URL("./fixtures/locales", import.meta.url))

describe("readiness", () => {
  const ready = computeReadiness({
    localesDir,
    pages: { home: ["common", "home"], legal: ["common"] },
  })

  it("ships a page only where every namespace passes", () => {
    // ru lacks plural forms, hi drops {{name}}, fr misses a key and common.json
    expect(ready.get("home")).toEqual(["en", "ja", "ar", "de"])
    expect(ready.get("legal")).toEqual(["en", "hi", "ja", "ar", "ru", "de"])
  })

  it("does not block on stale keys", () => {
    expect(checkAll(readCatalogs(localesDir))).toContainEqual({
      locale: "de",
      ns: "home",
      key: "old",
      kind: "extra",
    })
  })

  it("rejects unknown namespaces", () => {
    expect(() =>
      readinessFrom(readCatalogs(localesDir), { x: ["nope"] })
    ).toThrow('unknown namespace "nope"')
  })

  it("names the file that doesn't parse", () => {
    const dir = mkdtempSync(join(tmpdir(), "i18n-"))
    mkdirSync(join(dir, "en"))
    mkdirSync(join(dir, "notes"))
    writeFileSync(join(dir, "en", "readme.md"), "")
    writeFileSync(join(dir, "en", "bad.json"), "{")
    expect(() => readCatalogs(dir)).toThrow("bad.json")
  })
})
