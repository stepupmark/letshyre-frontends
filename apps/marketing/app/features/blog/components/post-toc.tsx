import { useTranslation } from "@workspace/i18n/react"

import { GuideToc } from "@/components/guide/guide-toc"
import { useActiveSection } from "@/hooks/use-active-section"
import type { Heading } from "@/lib/blog/post"

export function PostToc({ headings }: { headings: readonly Heading[] }) {
  const { t } = useTranslation("blog")
  const active = useActiveSection(headings.map((heading) => heading.id))

  return (
    <GuideToc
      label={t("post.toc")}
      groups={[
        {
          items: headings.map((heading) => ({
            anchor: heading.id,
            label: heading.text,
          })),
        },
      ]}
      active={active}
    />
  )
}
