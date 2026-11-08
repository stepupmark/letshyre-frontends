import { localePath } from "@workspace/i18n"
import { useFormat, useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"

export function PostRow({ post }: { post: Post }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const format = useFormat()

  return (
    <article className="group relative grid gap-2 py-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
      <p className="flex gap-3 text-sm text-muted-foreground sm:flex-col sm:gap-1">
        <time dateTime={post.publishedAt} className="tabular-nums">
          {format.date(post.publishedAt, { dateStyle: "medium" })}
        </time>
        <span>{t(`topics.${post.topic}`)}</span>
      </p>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-balance">
          <Link
            to={localePath(lang, postPath(post.slug))}
            prefetch="intent"
            className="rounded-sm outline-none group-hover:underline after:absolute after:inset-0 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {post.title}
          </Link>
        </h3>
        <p className="text-pretty text-muted-foreground">{post.description}</p>
      </div>
    </article>
  )
}
