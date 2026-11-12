// Node loads this through react-router.config.ts, so no Vite-only imports.

import { isLocale, type Locale } from "@workspace/i18n"
import { z } from "zod"

import { TOPICS, type Topic } from "./list.ts"
import { FILE, readMdx, SLUG } from "./post.ts"

const termSchema = z.strictObject({
  term: z.string().min(1),
  // the hover card and the page's meta description both use it
  short: z.string().min(20).max(160),
  aliases: z.array(z.string().min(1)).default([]),
})

export type Term = z.output<typeof termSchema> & { id: string; lang: Locale }

const guideSchema = z.strictObject({
  title: z.string().min(1),
  description: z.string().min(1),
  reading: z.array(z.string().regex(SLUG)).min(2),
})

const seriesSchema = z.strictObject({
  title: z.string().min(1),
  posts: z.array(z.string().regex(SLUG)).min(2),
})

export type Series = z.output<typeof seriesSchema> & {
  id: string
  lang: Locale
}

export type Guide = z.output<typeof guideSchema> & {
  topic: Topic
  lang: Locale
}

function idAndLang(file: string) {
  const [, id = "", lang = ""] = FILE.exec(file) ?? []
  if (!SLUG.test(id))
    throw new Error(`${file}: "${id}" isn't a lowercase-hyphenated id`)
  if (!isLocale(lang)) throw new Error(`${file}: "${lang}" isn't a locale`)
  return { id, lang }
}

/** Reads `content/glossary/<id>/<lang>.mdx`. */
export function parseTerm(file: string, source: string): Term {
  const { id, lang } = idAndLang(file)
  return { ...readMdx(file, source, termSchema).data, id, lang }
}

/** Reads `content/guides/<topic>/<lang>.mdx`, a topic page's opening guide. */
export function parseGuide(file: string, source: string): Guide {
  const { id, lang } = idAndLang(file)
  if (!(TOPICS as readonly string[]).includes(id))
    throw new Error(`${file}: "${id}" isn't a topic`)
  return {
    ...readMdx(file, source, guideSchema).data,
    topic: id as Topic,
    lang,
  }
}

/** Reads `content/series/<id>/<lang>.mdx`: posts meant to be read in order. */
export function parseSeries(file: string, source: string): Series {
  const { id, lang } = idAndLang(file)
  return { ...readMdx(file, source, seriesSchema).data, id, lang }
}

/** Every name a term goes by, for spotting it in a post. */
export const namesOf = (term: Pick<Term, "term" | "aliases">) => [
  term.term,
  ...term.aliases,
]
