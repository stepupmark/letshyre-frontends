import { describe, expect, it } from "vitest"

import { createCatalogLoader } from "../src/load.ts"

const load = createCatalogLoader({
  "./locales/en/home.json": () => Promise.resolve({ title: "Home" }),
  "./locales/en/common.json": () => Promise.resolve({ nav: "Nav" }),
  "./locales/hi/home.json": () => Promise.resolve({ title: "होम" }),
  "./locales/readme.txt": () => Promise.resolve({}),
})

describe("createCatalogLoader", () => {
  it("loads only the requested namespaces", async () => {
    expect(await load("en", ["home"])).toEqual({
      en: { home: { title: "Home" } },
    })
  })

  it("adds english as the fallback and skips untranslated namespaces", async () => {
    expect(await load("hi", ["home", "common"])).toEqual({
      hi: { home: { title: "होम" } },
      en: { home: { title: "Home" }, common: { nav: "Nav" } },
    })
  })

  it("throws when english is missing a namespace", async () => {
    await expect(load("en", ["pricing"])).rejects.toThrow("en/pricing")
  })
})
