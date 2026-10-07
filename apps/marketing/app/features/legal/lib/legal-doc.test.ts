import { LOCALES } from "@workspace/i18n"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import {
  buildToc,
  LEGAL_DOCS,
  type LegalDoc,
  readingMinutes,
} from "./legal-doc"

const richText = z.union([
  z.string(),
  z.array(
    z.union([
      z.string(),
      z.strictObject({ tip: z.string(), tooltip: z.string() }),
      z.strictObject({ highlight: z.string() }),
    ])
  ),
])

const legalDocSchema = z.strictObject({
  title: z.string(),
  intro: z.array(z.string()).min(1),
  sections: z
    .array(
      z.strictObject({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: z.string(),
        blocks: z.array(
          z.discriminatedUnion("type", [
            z.strictObject({ type: z.literal("p"), text: richText }),
            z.strictObject({ type: z.literal("subheading"), text: z.string() }),
            z.strictObject({ type: z.literal("ul"), items: z.array(richText) }),
            z.strictObject({
              type: z.literal("contact"),
              intro: z.string(),
              emailLabel: z.string(),
              team: z.string(),
            }),
          ])
        ),
      })
    )
    .min(1),
}) satisfies z.ZodType<LegalDoc>

const catalogs = import.meta.glob<Record<string, unknown>>(
  "/app/locales/*/legal*.json",
  { eager: true, import: "default" }
)

const docOf = (lang: string, ns: keyof typeof LEGAL_DOCS) =>
  catalogs[`/app/locales/${lang}/${ns}.json`]?.[LEGAL_DOCS[ns].key]

describe("legal documents", () => {
  // the page renders this JSON without checking it, so a bad translation must fail here
  it.each(LOCALES)(
    "%s matches the shape and the English section ids",
    (lang) => {
      for (const ns of Object.keys(LEGAL_DOCS) as (keyof typeof LEGAL_DOCS)[]) {
        const doc = docOf(lang, ns)
        if (doc === undefined) continue
        const parsed = legalDocSchema.parse(doc)
        const english = legalDocSchema.parse(docOf("en", ns))
        expect(
          parsed.sections.map((s) => s.id),
          ns
        ).toEqual(english.sections.map((s) => s.id))
      }
    }
  )
})

describe("buildToc", () => {
  it("nests subheadings without their trailing colon", () => {
    const [first] = buildToc(docOf("en", "legalPolicy") as LegalDoc)
    expect(first?.children[0]).toEqual({
      id: "information-we-collect-1",
      title: "Candidate Information",
    })
  })
})

describe("readingMinutes", () => {
  it("counts words in scripts without spaces", () => {
    const terms = docOf("ja", "legalTerms") as LegalDoc
    expect(readingMinutes(terms, "ja")).toBeGreaterThan(1)
  })
})
