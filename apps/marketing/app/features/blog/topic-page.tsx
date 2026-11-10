import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import type { Post, Topic } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { FeedLink } from "./components/feed-link"
import { PendingList } from "./components/pending-list"
import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"
import { RelatedPosts } from "./components/related-posts"
import { TopicNav } from "./components/topic-nav"

/** Who the topic's posts are written for; posts for everyone don't narrow it. */
function readersOf(posts: readonly Post[]) {
  const audiences = new Set(posts.map((post) => post.audience))
  if (audiences.has("employers") && !audiences.has("candidates"))
    return "employers"
  if (audiences.has("candidates") && !audiences.has("employers"))
    return "candidates"
  return "both"
}

export function TopicPage({
  topic,
  posts,
  others,
  topics,
}: {
  topic: Topic
  posts: readonly Post[]
  others: readonly Post[]
  topics: readonly { topic: Topic; count: number }[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <>
      <PageHeader
        variant="masthead"
        eyebrow={
          <Link
            to={localePath(lang, PAGES.blog.path)}
            className="hover:underline"
          >
            {t("index.eyebrow")}
          </Link>
        }
        title={t(`topics.${topic}`)}
        description={t(`topicPage.description.${topic}`)}
      >
        <p className="text-sm font-medium text-foreground/75">
          {t(`topicPage.for.${readersOf(posts)}`)}
        </p>
        <FeedLink />
      </PageHeader>
      <TopicNav topics={topics} current={topic} />
      <Container className="py-10 sm:py-14">
        <PendingList>
          <PostList posts={posts} />
        </PendingList>
      </Container>
      <RelatedPosts title={t("topicPage.others")} posts={others} />
      <PostCta audience="everyone" />
    </>
  )
}
