export type LegalNamespace = "legalTerms" | "legalPolicy" | "legalRefund"

/** Catalog key of each document and when its English text last changed. */
export const LEGAL_DOCS = {
  legalTerms: { key: "terms", updated: "2026-09-08" },
  legalPolicy: { key: "policy", updated: "2026-07-31" },
  legalRefund: { key: "refund", updated: "2026-07-31" },
} as const satisfies Record<LegalNamespace, { key: string; updated: string }>

/** Plain text, or runs mixing text with highlighted and explained terms. */
export type RichText =
  string | (string | { tip: string; tooltip: string } | { highlight: string })[]

export type LegalBlock =
  | { type: "p"; text: RichText }
  | { type: "subheading"; text: string }
  | { type: "ul"; items: RichText[] }
  | { type: "contact"; intro: string; emailLabel: string; team: string }

export interface LegalDoc {
  title: string
  intro: string[]
  sections: { id: string; title: string; blocks: LegalBlock[] }[]
}

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
  }
}

/** Reading time at 200 words a minute, never under one. Segmenter counts words in scripts without spaces too. */
export function readingMinutes(doc: LegalDoc, lang: string): number {
  const text = [
    ...doc.intro,
    ...doc.sections.flatMap((s) => [s.title, ...s.blocks.flatMap(blockText)]),
  ].join(" ")
  let words = 0
  for (const segment of new Intl.Segmenter(lang, {
    granularity: "word",
  }).segment(text)) {
    if (segment.isWordLike) words++
  }
  return Math.max(1, Math.round(words / 200))
}
