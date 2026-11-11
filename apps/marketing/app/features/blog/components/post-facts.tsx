import { useFormat, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"

import type { Post } from "@/lib/blog/post"

/** `short` is for lists: one date, the update if there is one. */
export function PostFacts({
  post,
  variant = "full",
}: {
  post: Pick<
    Post,
    "publishedAt" | "updatedAt" | "minutes" | "preview" | "draft"
  >
  variant?: "full" | "short"
}) {
  const { t } = useTranslation("blog")
  const format = useFormat()
  // publish dates are calendar days, so read them in UTC or the Americas see the day before
  const date = (iso: string, dateStyle: "long" | "medium" = "long") =>
    format.date(iso, { dateStyle, timeZone: "UTC" })

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      {post.preview && (
        <Badge variant="outline">
          {post.draft ? t("post.draft") : t("post.scheduled")}
        </Badge>
      )}
      {variant === "short" ? (
        post.updatedAt ? (
          <time dateTime={post.updatedAt}>
            {t("post.updated", {
              date: date(post.updatedAt, "medium"),
            })}
          </time>
        ) : (
          <time dateTime={post.publishedAt}>
            {date(post.publishedAt, "medium")}
          </time>
        )
      ) : (
        <>
          <time dateTime={post.publishedAt}>
            {t("post.published", { date: date(post.publishedAt) })}
          </time>
          {post.updatedAt && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={post.updatedAt}>
                {t("post.updated", { date: date(post.updatedAt) })}
              </time>
            </>
          )}
        </>
      )}
      <span aria-hidden>·</span>
      <span className="tabular-nums">
        {t("post.readTime", { count: post.minutes })}
      </span>
    </p>
  )
}
