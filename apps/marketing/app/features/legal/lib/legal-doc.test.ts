import { describe, expect, it } from "vitest"

import legalPolicy from "@/locales/en/legalPolicy.json"
import legalRefund from "@/locales/en/legalRefund.json"
import legalTerms from "@/locales/en/legalTerms.json"

import { buildToc, legalDocSchema, readingMinutes } from "./legal-doc"

const docs = {
  terms: legalDocSchema.parse(legalTerms.terms),
  policy: legalDocSchema.parse(legalPolicy.policy),
  refund: legalDocSchema.parse(legalRefund.refund),
}

describe("legalDocSchema", () => {
  it("parses every English document and normalises the intro", () => {
    expect(docs.terms.intro).toHaveLength(1)
    expect(docs.policy.intro.length).toBeGreaterThan(1)
    expect(docs.refund.sections.at(-1)?.id).toBe("contact-us")
  })

  it("rejects an unknown block type", () => {
    expect(
      legalDocSchema.safeParse({
        title: "T",
        intro: "I",
        sections: [{ id: "a", title: "A", blocks: [{ type: "video" }] }],
      }).success
    ).toBe(false)
  })
})

describe("buildToc", () => {
  it("lists sections in order with unique ids", () => {
    const toc = buildToc(docs.terms)
    expect(toc).toHaveLength(docs.terms.sections.length)
    expect(toc[0]).toMatchObject({
      id: "platform-overview",
      title: "1. Platform Overview",
      children: [],
    })
    const ids = toc.flatMap((e) => [e.id, ...e.children.map((c) => c.id)])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("nests subheadings without their trailing colon", () => {
    const [first] = buildToc(docs.policy)
    expect(first?.children[0]).toEqual({
      id: "information-we-collect-1",
      title: "Candidate Information",
    })
  })
})

describe("readingMinutes", () => {
  it("is at least one minute", () => {
    expect(
      readingMinutes({ title: "T", intro: ["Short."], sections: [] })
    ).toBe(1)
    expect(readingMinutes(docs.terms)).toBeGreaterThan(1)
  })
})
