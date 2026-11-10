import { useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"
import { usePagePath } from "@/hooks/use-page-path"
import type { Post } from "@/lib/blog/post"

import { CTA_TARGETS } from "../lib/cta"
import { readerAudience, rememberAudience } from "../lib/reader"

/**
 * The closing call to action. One written for everyone turns into the employer's or the
 * professional's once the reader has shown which they are.
 */
export function PostCta({ audience }: { audience: Post["audience"] }) {
  const { t } = useTranslation("blog")
  const pagePath = usePagePath()
  const reader = readerAudience.useValue()
  const shown = audience === "everyone" ? (reader ?? "everyone") : audience
  const target = CTA_TARGETS[shown]

  return (
    <div
      // "I'm hiring" and "I'm looking for work" say who the reader is
      onClickCapture={(event) => {
        if (shown !== "everyone") return
        const link = (event.target as HTMLElement).closest("a")
        if (!link) return
        rememberAudience(
          link.getAttribute("href") === target.href ? "employers" : "candidates"
        )
      }}
    >
      <CtaBand
        title={t(`cta.${shown}.title`)}
        description={t(`cta.${shown}.description`)}
        primary={{ label: t(`cta.${shown}.primary`), href: target.href }}
        secondary={{
          label: t(`cta.${shown}.secondary`),
          to: pagePath(target.page),
        }}
      />
    </div>
  )
}
