import { createContext } from "react"

import { APP_LINKS } from "@/lib/app-links"
import type { Post } from "@/lib/blog/post"

export const CTA_TARGETS = {
  employers: { href: APP_LINKS.employerRegister, page: "pricing" },
  candidates: { href: APP_LINKS.candidateRegister, page: "candidates" },
  everyone: { href: APP_LINKS.employerRegister, page: "candidates" },
} as const

/** The section heading a long post's mid-post call to action goes above, and who it's for. */
export const InlineCtaSlot = createContext<
  { before: string; audience: Post["audience"] } | undefined
>(undefined)

/** Halfway through, a post of five minutes or more with four sections or more. */
export function inlineCtaHeading(
  post: Pick<Post, "minutes" | "headings">
): string | undefined {
  if (post.minutes < 5 || post.headings.length < 4) return undefined
  return post.headings[Math.floor(post.headings.length / 2)]?.id
}
