import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"

import { PostFacts } from "./post-facts"

export function PostLead({ post }: { post: Post }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <article className="group relative grid gap-4 rounded-xl border p-6 transition-colors duration-200 focus-within:ring-3 focus-within:ring-ring/50 hover:bg-muted/40 motion-reduce:transition-none sm:p-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          {t("index.latest")}
          <span aria-hidden className="mx-2">
            /
          </span>
          {t(`topics.${post.topic}`)}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          <Link
            to={localePath(lang, postPath(post.slug))}
            prefetch="intent"
            className="outline-none after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h2>
        <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
          {post.description}
        </p>
      </div>
      <div className="flex flex-col justify-between gap-4 lg:border-s lg:ps-8">
        <PostFacts post={post} />
        <ArrowRightIcon
          aria-hidden
          className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
        />
      </div>
    </article>
  )
}
