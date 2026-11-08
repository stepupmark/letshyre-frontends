import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import type { Post } from "@/lib/blog/post"

import { PostRow } from "./post-row"

export function RelatedPosts({ posts }: { posts: readonly Post[] }) {
  const { t } = useTranslation("blog")
  const titleId = useId()
  if (!posts.length) return null

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2">
      <h2 id={titleId} className="text-xl font-semibold tracking-tight">
        {t("post.related")}
      </h2>
      <ol className="divide-y border-y">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostRow post={post} />
          </li>
        ))}
      </ol>
    </section>
  )
}
