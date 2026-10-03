import { z } from "zod"

export type LegalNamespace = "legalTerms" | "legalPolicy" | "legalRefund"

/** Catalog key of each document and when its English text last changed. */
export const LEGAL_DOCS = {
  legalTerms: { key: "terms", updated: "2026-09-08" },
  legalPolicy: { key: "policy", updated: "2026-07-31" },
  legalRefund: { key: "refund", updated: "2026-07-31" },
} as const satisfies Record<LegalNamespace, { key: string; updated: string }>

// legal text can carry inline emphasis: a string, or runs mixing strings with terms
const runSchema = z.union([
  z.string(),
  z.object({ tip: z.string(), tooltip: z.string() }),
  z.object({ highlight: z.string() }),
])
const richTextSchema = z.union([z.string(), z.array(runSchema)])

export type RichText = z.output<typeof richTextSchema>

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: richTextSchema }),
  z.object({ type: z.literal("subheading"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(richTextSchema) }),
  z.object({ type: z.literal("spacer") }),
  z.object({
    type: z.literal("contact"),
    intro: z.string(),
    emailLabel: z.string(),
    email: z.string(),
    team: z.string(),
  }),
])

export const legalDocSchema = z.object({
  title: z.string(),
  intro: z
    .union([z.string(), z.array(z.string())])
    .transform((intro) => (typeof intro === "string" ? [intro] : intro)),
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      blocks: z.array(blockSchema),
    })
  ),
})

export type LegalDoc = z.output<typeof legalDocSchema>
export type LegalBlock = z.output<typeof blockSchema>

export interface TocEntry {
  id: string
  title: string
  children: { id: string; title: string }[]
}

export const subheadingId = (sectionId: string, index: number) =>
  `${sectionId}-${index + 1}`

/** h2 per section, with its h3 subheadings nested. Ids are stable across languages. */
export function buildToc(doc: LegalDoc): TocEntry[] {
  return doc.sections.map((section) => ({
    id: section.id,
    title: section.title,
    children: section.blocks
      .filter((block) => block.type === "subheading")
      .map((block, index) => ({
        id: subheadingId(section.id, index),
        title: block.text.replace(/[:：]\s*$/, ""),
      })),
  }))
}

function plainText(text: RichText): string {
  if (typeof text === "string") return text
  return text
    .map((run) =>
      typeof run === "string" ? run : "tip" in run ? run.tip : run.highlight
    )
    .join("")
}

function blockText(block: LegalBlock): string[] {
  switch (block.type) {
    case "p":
      return [plainText(block.text)]
    case "subheading":
      return [block.text]
    case "ul":
      return block.items.map(plainText)
    case "contact":
      return [block.intro, block.team]
    case "spacer":
      return []
  }
}

/** Rough reading time at 200 words a minute, never less than one. */
export function readingMinutes(doc: LegalDoc): number {
  const text = [
    ...doc.intro,
    ...doc.sections.flatMap((s) => [s.title, ...s.blocks.flatMap(blockText)]),
  ].join(" ")
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
