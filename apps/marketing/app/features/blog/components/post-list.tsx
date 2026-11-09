import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { Container } from "@/components/section"
import type { Post } from "@/lib/blog/post"

import { PostCard } from "./post-card"
import { PostLead } from "./post-lead"

export function PostList({ posts }: { posts: readonly Post[] }) {
  const { t } = useTranslation("blog")
  const moreId = useId()
  const [lead, ...rest] = posts

  return (
    <Container className="flex flex-col gap-12 py-10 sm:py-14">
      {lead && <PostLead post={lead} />}
      {rest.length > 0 && (
        <section aria-labelledby={moreId} className="flex flex-col gap-6">
          <h2 id={moreId} className="text-xl font-semibold tracking-tight">
            {t("index.more")}
          </h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </Container>
  )
}
