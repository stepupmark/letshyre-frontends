import { useFormat, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"

import type { Post } from "@/lib/blog/post"

export function PostFacts({
  post,
}: {
  post: Pick<
    Post,
    "publishedAt" | "updatedAt" | "minutes" | "preview" | "draft"
  >
}) {
  const { t } = useTranslation("blog")
  const format = useFormat()
  const date = (iso: string) => format.date(iso, { dateStyle: "long" })

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      {post.preview && (
        <Badge variant="outline">
          {post.draft ? t("post.draft") : t("post.scheduled")}
        </Badge>
      )}
      {post.updatedAt ? (
        <time dateTime={post.updatedAt}>
          {t("post.updated", { date: date(post.updatedAt) })}
        </time>
      ) : (
        <time dateTime={post.publishedAt}>
          {t("post.published", { date: date(post.publishedAt) })}
        </time>
      )}
      <span aria-hidden>·</span>
      <span className="tabular-nums">
        {t("post.readTime", { count: post.minutes })}
      </span>
    </p>
  )
}
