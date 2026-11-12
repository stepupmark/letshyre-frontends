import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"
import type { PostSummary } from "@/lib/blog/post"

import { PostCover } from "./post-cover"
import { PostFacts } from "./post-facts"

export function PostLead({ post }: { post: PostSummary }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <article className="group relative grid overflow-hidden rounded-xl border bg-card transition-colors duration-200 focus-within:ring-3 focus-within:ring-ring/50 hover:border-brand/40 motion-reduce:transition-none lg:grid-cols-2">
      <PostCover
        post={post}
        priority
        className="border-b lg:border-e lg:border-b-0"
      />
      <div className="flex flex-col gap-3 p-5 sm:gap-4 sm:p-8">
        <p className="text-sm font-medium text-brand-text">
          {t(`topics.${post.topic}`)}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-balance transition-colors duration-200 group-hover:text-brand-text motion-reduce:transition-none sm:text-3xl">
          <Link
            to={localePath(lang, postPath(post.slug))}
            prefetch="intent"
            className="outline-none after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h2>
        <p className="text-lg text-pretty text-muted-foreground">
          {post.description}
        </p>
        <PostFacts post={post} variant="short" />
      </div>
    </article>
  )
}
