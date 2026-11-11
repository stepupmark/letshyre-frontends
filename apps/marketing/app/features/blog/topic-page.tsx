import { useTranslation } from "@workspace/i18n/react"

import { Container, PageHeader } from "@/components/section"
import type { PostSummary, Topic } from "@/lib/blog/post"

import { FeedLink } from "./components/feed-link"
import { PendingList } from "./components/pending-list"
import { BlogCrumbs } from "./components/blog-crumbs"
import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"
import { RelatedPosts } from "./components/related-posts"
import { TopicGuide, type TopicGuideData } from "./components/topic-guide"
import { TopicNav } from "./components/topic-nav"

export function TopicPage({
  topic,
  guide,
  readers,
  posts,
  others,
  topics,
}: {
  topic: Topic
  guide?: TopicGuideData
  readers: "employers" | "candidates" | "both"
  posts: readonly PostSummary[]
  others: readonly PostSummary[]
  topics: readonly { topic: Topic; count: number }[]
}) {
  const { t } = useTranslation("blog")

  return (
    <>
      <PageHeader
        variant="masthead"
        eyebrow={<BlogCrumbs />}
        title={t(`topics.${topic}`)}
        description={t(`topicPage.description.${topic}`)}
      >
        <p className="text-sm font-medium text-foreground/75">
          {t(`topicPage.for.${readers}`)}
        </p>
        <FeedLink />
      </PageHeader>
      <TopicNav topics={topics} current={topic} />
      <Container className="flex flex-col gap-12 py-10 sm:py-14">
        {guide && <TopicGuide key={topic} topic={topic} guide={guide} />}
        <PendingList>
          <PostList posts={posts} />
        </PendingList>
      </Container>
      <RelatedPosts title={t("topicPage.others")} posts={others} />
      <PostCta audience="everyone" />
    </>
  )
}
