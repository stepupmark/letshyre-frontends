import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import type { PostSummary } from "@/lib/blog/search"

import { PostCard } from "./post-card"
import { PostLead } from "./post-lead"

export function PostList({
  posts,
  lead = true,
}: {
  posts: readonly PostSummary[]
  lead?: boolean
}) {
  const { t } = useTranslation("blog")
  const moreId = useId()
  const first = lead ? posts[0] : undefined
  const rest = lead ? posts.slice(1) : posts

  return (
    <div className="flex flex-col gap-12">
      {first && <PostLead post={first} />}
      {rest.length > 0 && (
        <section aria-labelledby={moreId} className="flex flex-col gap-6">
          <h2
            id={moreId}
            className={
              lead ? "text-xl font-semibold tracking-tight" : "sr-only"
            }
          >
            {t("index.more")}
          </h2>
          <PostGrid posts={rest} />
        </section>
      )}
    </div>
  )
}

export function PostGrid({
  posts,
  highlight,
}: {
  posts: readonly PostSummary[]
  highlight?: readonly string[]
}) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} highlight={highlight} />
        </li>
      ))}
    </ol>
  )
}
