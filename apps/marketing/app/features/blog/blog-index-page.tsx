import { useTranslation } from "@workspace/i18n/react"

import { Container, PageHeader } from "@/components/section"
import type { Post } from "@/lib/blog/post"

import { PostCard } from "./components/post-card"

export function BlogIndexPage({ posts }: { posts: Post[] }) {
  const { t } = useTranslation("blog")

  return (
    <>
      <PageHeader
        eyebrow={t("index.eyebrow")}
        title={t("index.title")}
        description={t("index.description")}
      />
      <Container className="py-10 sm:py-14">
        <ol className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug} className="flex">
              <PostCard post={post} />
            </li>
          ))}
        </ol>
      </Container>
    </>
  )
}
