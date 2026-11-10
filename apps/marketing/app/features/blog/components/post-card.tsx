import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"
import type { PostSummary } from "@/lib/blog/search"

import { Highlight } from "./highlight"
import { PostCover } from "./post-cover"
import { PostFacts } from "./post-facts"

export function PostCard({
  post,
  highlight,
}: {
  post: PostSummary
  highlight?: readonly string[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors duration-200 focus-within:ring-3 focus-within:ring-ring/50 hover:border-brand/40 motion-reduce:transition-none">
      <PostCover post={post} className="border-b" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm font-medium text-brand-text">
          {t(`topics.${post.topic}`)}
        </p>
        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-balance transition-colors duration-200 group-hover:text-brand-text motion-reduce:transition-none">
          <Link
            to={localePath(lang, postPath(post.slug))}
            prefetch="intent"
            className="outline-none after:absolute after:inset-0"
          >
            <Highlight text={post.title} words={highlight} />
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">
          <Highlight text={post.description} words={highlight} />
        </p>
        <div className="mt-auto pt-2">
          <PostFacts post={post} variant="short" />
        </div>
      </div>
    </article>
  )
}
