import { describe, expect, it } from "vitest"

import type { Catalog } from "../src/create-i18n.ts"
import {
  checkCatalog,
  findUnusedKeys,
  flatten,
  placeholders,
  pluralCategories,
} from "../src/node/checks.ts"

describe("flatten", () => {
  it("flattens nested objects and arrays", () => {
    expect([...flatten({ a: { b: "1" }, list: ["x", { y: "2" }] })]).toEqual([
      ["a.b", "1"],
      ["list.0", "x"],
      ["list.1.y", "2"],
    ])
  })
})

describe("placeholders", () => {
  it("collects interpolations, tags and nesting", () => {
    expect(
      placeholders("{{ count, number }} <b>x</b> $t(common:ok) {{name}}")
    ).toEqual(["$t(common:ok)", "<b>", "{{count}}", "{{name}}"])
  })
})

describe("plural categories", () => {
  it("matches CLDR for arabic, russian and japanese", () => {
    expect(pluralCategories("ar")).toHaveLength(6)
    expect(pluralCategories("ru")).toHaveLength(4)
    expect(pluralCategories("ja")).toEqual(["other"])
  })
})

const en = {
  title: "Hi {{name}}",
  n_one: "{{count}} job",
  n_other: "{{count}} jobs",
}

const kinds = (target: Catalog) =>
  checkCatalog("ru", "x", en, target).map((i) => `${i.kind}:${i.key}`)

describe("checkCatalog", () => {
  it("passes a complete translation", () => {
    expect(
      checkCatalog("ja", "x", en, {
        title: "{{name}}さん",
        n_other: "{{count}} 件",
      })
    ).toEqual([])
  })

  it("passes english against itself", () => {
    expect(checkCatalog("en", "x", en, en)).toEqual([])
  })

  it("flags missing keys", () => {
    expect(kinds({})).toEqual(["missing:title", "missing:n"])
  })

  it("flags placeholders that don't match", () => {
    expect(
      kinds({
        title: "Привет",
        n_one: "один",
        n_few: "{{count}}",
        n_many: "{{count}}",
        n_other: "{{count}}",
      })
    ).toEqual(["placeholders:title"])
  })

  it("flags plurals without every form the locale needs", () => {
    expect(
      kinds({ title: "{{name}}", n_one: "{{count}}", n_other: "{{count}}" })
    ).toEqual(["plural:n"])
  })

  it("flags invented placeholders in plural forms and stale keys", () => {
    expect(
      kinds({
        title: "{{name}}",
        n_one: "{{x}}",
        n_few: "a",
        n_many: "a",
        n_other: "a",
        gone: "z",
      })
    ).toEqual(["placeholders:n", "extra:gone"])
  })

  it("treats a missing file as fully missing", () => {
    expect(checkCatalog("de", "x", { a: "A" })).toEqual([
      { locale: "de", ns: "x", key: "a", kind: "missing" },
    ])
  })
})

describe("findUnusedKeys", () => {
  const catalogs = new Map<string, Catalog>([
    [
      "home",
      {
        hero: { title: "T", body: "B" },
        faq: ["q1"],
        jobs_one: "1",
        jobs_other: "n",
        ghost: "x",
      },
    ],
  ])

  it("counts literal keys, namespaced keys, parents and plural bases as used", () => {
    const sources = [
      't("hero.title")',
      "t('home:jobs', { count })",
      "t(`faq`, { returnObjects: true })",
      't("hero.body")',
    ]
    expect(findUnusedKeys(catalogs, sources)).toEqual(["home:ghost"])
  })
})
