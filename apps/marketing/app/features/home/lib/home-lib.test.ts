import { describe, expect, it } from "vitest"

import home from "@/locales/en/home.json"

import { homeJsonLd } from "./home-json-ld"
import { plainText } from "./plain-text"

describe("plainText", () => {
  it("drops inline markup and turns breaks into spaces", () => {
    expect(plainText("The AI Platform for <hl>Notice-Period Talent</hl>")).toBe(
      "The AI Platform for Notice-Period Talent"
    )
    expect(plainText("Define the role,<br/><hl>let AI do the rest</hl>")).toBe(
      "Define the role, let AI do the rest"
    )
  })
})

describe("homeJsonLd", () => {
  const lookup = (key: string): unknown =>
    key
      .split(".")
      .reduce<unknown>(
        (node, part) => (node as Record<string, unknown>)[part],
        home
      )

  it("describes the app, the FAQ and the page", () => {
    const schemas = homeJsonLd({
      lang: "en",
      path: "",
      t: (key) => lookup(key) as string,
    })
    expect(schemas.map((s) => s["@type"])).toEqual([
      "SoftwareApplication",
      "FAQPage",
      "WebPage",
    ])
    expect((schemas[1]?.mainEntity as unknown[]).length).toBe(
      home.faq.items.length
    )
  })
})
