import { localePath, type Locale } from "@workspace/i18n"

import { env } from "./env"

/** A page on the marketing site, in the reader's language. */
export const sitePage = (locale: Locale, path: string) =>
  new URL(localePath(locale, path), env.VITE_SITE_URL).href
