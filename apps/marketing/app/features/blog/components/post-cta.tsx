import { useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"
import { usePagePath } from "@/hooks/use-page-path"
import type { Post } from "@/lib/blog/post"

import { CTA_TARGETS } from "../lib/cta"

export function PostCta({ audience }: { audience: Post["audience"] }) {
  const { t } = useTranslation("blog")
  const pagePath = usePagePath()
  const target = CTA_TARGETS[audience]

  return (
    <CtaBand
      title={t(`cta.${audience}.title`)}
      description={t(`cta.${audience}.description`)}
      primary={{ label: t(`cta.${audience}.primary`), href: target.href }}
      secondary={{
        label: t(`cta.${audience}.secondary`),
        to: pagePath(target.page),
      }}
    />
  )
}
