import { useFormat, useTranslation } from "@workspace/i18n/react"
import { CalendarIcon, ClockIcon } from "lucide-react"

import type { Post } from "@/lib/blog/post"

export function PostFacts({
  post,
}: {
  post: Pick<Post, "publishedAt" | "updatedAt" | "minutes">
}) {
  const { t } = useTranslation("blog")
  const format = useFormat()
  const date = (iso: string) => format.date(iso, { dateStyle: "long" })

  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon aria-hidden className="size-4 text-brand" />
        {post.updatedAt ? (
          <time dateTime={post.updatedAt}>
            {t("post.updated", { date: date(post.updatedAt) })}
          </time>
        ) : (
          <time dateTime={post.publishedAt}>
            {t("post.published", { date: date(post.publishedAt) })}
          </time>
        )}
      </span>
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <ClockIcon aria-hidden className="size-4 text-brand" />
        {t("post.readTime", { count: post.minutes })}
      </span>
    </p>
  )
}
