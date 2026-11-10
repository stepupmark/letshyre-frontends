import { type Locale, localePath } from "@workspace/i18n"

import type { JsonLd } from "./schema"
import { absUrl } from "./site"

// kept apart from schema.ts, which every page loads; only blog pages need these
/** A post's own questions, already plain text. */
export const postFaqSchema = (
  faq: readonly { q: string; a: string }[]
): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
})

export function definedTermSchema({
  lang,
  path,
  glossary,
  name,
  description,
}: {
  lang: Locale
  path: string
  /** The glossary page's path, relative to the locale. */
  glossary: string
  name: string
  description: string
}): JsonLd {
  const url = absUrl(localePath(lang, path))
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${url}#term`,
    name,
    description,
    url,
    inLanguage: lang,
    inDefinedTermSet: absUrl(localePath(lang, glossary)),
  }
}
