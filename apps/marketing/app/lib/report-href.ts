import { SITE } from "@/lib/seo/site"

/** A mailto link to the site inbox with the subject and body filled in. */
export const reportHref = (subject: string, body: string) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
