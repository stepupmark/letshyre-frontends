import { PAGES } from "@/lib/pages"

export type LegalNamespace = "legalTerms" | "legalPolicy" | "legalRefund"

/** Catalog key of each document and when its English text last changed. */
export const LEGAL_DOCS = {
  legalTerms: {
    key: "terms",
    updated: "2026-09-08",
    path: PAGES.terms.path,
    label: "footer.links.terms",
  },
  legalPolicy: {
    key: "policy",
    updated: "2026-07-31",
    path: PAGES.privacy.path,
    label: "footer.links.privacy",
  },
  legalRefund: {
    key: "refund",
    updated: "2026-07-31",
    path: PAGES.refund.path,
    label: "footer.links.refund",
  },
} as const satisfies Record<
  LegalNamespace,
  { key: string; updated: string; path: string; label: string }
>

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

/** Block index to anchor id, for each subheading in a section. */
export function subheadingIds(sectionId: string, blocks: LegalBlock[]) {
  const ids = new Map<number, string>()
  blocks.forEach((block, index) => {
    if (block.type === "subheading")
      ids.set(index, subheadingId(sectionId, ids.size))
  })
  return ids
}

/** Splits "7. Payments" into its number and the rest. */
export function splitNumber(title: string) {
  const [, number, rest] = /^(\d+)\.\s*(.*)$/.exec(title) ?? []
  return number ? { number, rest: rest ?? "" } : { number: null, rest: title }
}

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
