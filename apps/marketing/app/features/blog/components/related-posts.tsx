import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { Container } from "@/components/section"
import type { Post } from "@/lib/blog/post"

import { PostCard } from "./post-card"

export function RelatedPosts({ posts }: { posts: readonly Post[] }) {
  const { t } = useTranslation("blog")
  const titleId = useId()
  if (!posts.length) return null

  return (
    <section aria-labelledby={titleId} className="border-t print:hidden">
      <Container className="flex flex-col gap-6 py-10 sm:py-14">
        <h2 id={titleId} className="text-xl font-semibold tracking-tight">
          {t("post.related")}
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
