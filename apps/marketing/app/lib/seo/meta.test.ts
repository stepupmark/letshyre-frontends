import { describe, expect, it } from "vitest"

import { buildMeta } from "./meta"
import { collectMessages } from "./page-meta"

describe("buildMeta", () => {
  const meta = buildMeta({
    lang: "ar",
    path: "/pricing",
    title: "Pricing",
    description: "Plans",
    locales: ["en", "ar"],
    og: "pricing",
    jsonLd: [{ "@type": "FAQPage" }],
  })

  const links = (rel: string) =>
    meta.filter((m) => "rel" in m && m.rel === rel) as {
      href: string
      hrefLang?: string
    }[]

  it("points canonical at itself and lists only ready locales plus x-default", () => {
    expect(links("canonical").map((l) => new URL(l.href).pathname)).toEqual([
      "/ar/pricing",
    ])
    expect(links("alternate").map((l) => l.hrefLang)).toEqual([
      "en",
      "ar",
      "x-default",
    ])
    expect(new URL(links("alternate").at(-1)?.href ?? "").pathname).toBe(
      "/en/pricing"
    )
  })

  it("sets locale-aware Open Graph tags", () => {
    expect(meta).toContainEqual({ property: "og:locale", content: "ar_AR" })
    expect(meta).toContainEqual({
      property: "og:locale:alternate",
      content: "en_US",
    })
    expect(meta).toContainEqual(
      expect.objectContaining({
        property: "og:image",
        content: expect.stringMatching(/\/og\/pricing\.jpg$/) as unknown,
      })
    )
  })

  it("always includes the organization and website nodes before page schema", () => {
    const types = meta
      .filter((m) => "script:ld+json" in m)
      .map(
        (m) =>
          (m as Record<string, { "@type": string }>)["script:ld+json"]?.[
            "@type"
          ]
      )
    expect(types).toEqual(["Organization", "WebSite", "FAQPage"])
  })
})

describe("collectMessages", () => {
  it("merges catalogs from every match", () => {
    expect(
      collectMessages([
        { loaderData: { messages: { en: { common: { a: "1" } } } } },
        { loaderData: undefined },
        { loaderData: { messages: { en: { home: { b: "2" } } } } },
      ])
    ).toEqual({ en: { common: { a: "1" }, home: { b: "2" } } })
  })
})
