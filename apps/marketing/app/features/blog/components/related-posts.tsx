import { useId } from "react"

import { Container } from "@/components/section"
import type { PostSummary } from "@/lib/blog/post"

import { PostGrid } from "./post-list"

export function RelatedPosts({
  title,
  posts,
}: {
  title: string
  posts: readonly PostSummary[]
}) {
  const titleId = useId()
  if (!posts.length) return null

  return (
    <section aria-labelledby={titleId} className="border-t print:hidden">
      <Container className="flex flex-col gap-6 py-10 sm:py-14">
        <h2 id={titleId} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <PostGrid posts={posts} />
      </Container>
    </section>
  )
}
