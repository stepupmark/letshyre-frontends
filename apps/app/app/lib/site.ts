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

/** A chapter of a marketing guide. They're English only for now; other locales redirect there. */
export const guideChapter = (locale: Locale, chapter: GuideChapter) => {
  const [path, anchor] = GUIDE_CHAPTERS[chapter]
  return `${sitePage(locale, path)}#${anchor}`
}
