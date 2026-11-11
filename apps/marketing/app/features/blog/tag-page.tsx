import { useTranslation } from "@workspace/i18n/react"

import { Container, PageHeader } from "@/components/section"
import type { PostSummary, Tag } from "@/lib/blog/post"

import { FeedLink } from "./components/feed-link"
import { PendingList } from "./components/pending-list"
import { BlogCrumbs } from "./components/blog-crumbs"
import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"

export function TagPage({
  tag,
  posts,
}: {
  tag: Tag
  posts: readonly PostSummary[]
}) {
  const { t } = useTranslation("blog")
  const name = t(`tags.${tag}`)

  return (
    <div className="reading-font">
      <PageHeader
        variant="masthead"
        eyebrow={<BlogCrumbs />}
        title={name}
        description={t("tagPage.description", { tag: name })}
      >
        <FeedLink />
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <PendingList>
          <PostList posts={posts} lead={false} />
        </PendingList>
      </Container>
      <PostCta audience="everyone" />
    </div>
  )
}
