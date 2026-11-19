import { localePath, type Locale } from "@workspace/i18n"

import { env } from "./env"

/** A page on the marketing site, in the reader's language. */
export const sitePage = (locale: Locale, path: string) =>
  new URL(localePath(locale, path), env.VITE_SITE_URL).href

// anchors published by the marketing guides; keep in step with their chapters
const GUIDE_CHAPTERS = {
  post: ["/employer-guide", "post-a-job"],
  pool: ["/employer-guide", "find-candidates"],
  unlock: ["/employer-guide", "unlock-candidates"],
  team: ["/employer-guide", "bring-your-team"],
  prepare: ["/candidate-guide", "what-to-keep-ready"],
  afterInterview: ["/candidate-guide", "after-your-interview"],
} as const

export type GuideChapter = keyof typeof GUIDE_CHAPTERS

// the guides marketing publishes in more than English; add a locale here once it ships there
const GUIDE_LOCALES: readonly Locale[] = ["en"]

/** A chapter of a marketing guide, in English where the reader's language has no guide. */
export const guideChapter = (locale: Locale, chapter: GuideChapter) => {
  const [path, anchor] = GUIDE_CHAPTERS[chapter]
  const lang = GUIDE_LOCALES.includes(locale) ? locale : "en"
  return `${sitePage(lang, path)}#${anchor}`
}
