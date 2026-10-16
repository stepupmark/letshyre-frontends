import { localePath, type Locale } from "@workspace/i18n"

import { env } from "./env"

/** A page on the marketing site, in the reader's language. */
export const sitePage = (locale: Locale, path: string) =>
  new URL(localePath(locale, path), env.VITE_SITE_URL).href

// anchors published by the marketing employer guide; keep in step with its chapters
const GUIDE_CHAPTERS = {
  post: "post-a-job",
  pool: "find-candidates",
  unlock: "unlock-candidates",
  team: "bring-your-team",
} as const

export type GuideChapter = keyof typeof GUIDE_CHAPTERS

/** A chapter of the employer guide. It's English only for now; other locales redirect there. */
export const employerGuide = (locale: Locale, chapter: GuideChapter) =>
  `${sitePage(locale, "/employer-guide")}#${GUIDE_CHAPTERS[chapter]}`
