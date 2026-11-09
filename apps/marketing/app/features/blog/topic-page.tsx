import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { PageHeader } from "@/components/section"
import type { Post, Topic } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"
import { TopicNav } from "./components/topic-nav"

export function TopicPage({
  topic,
  posts,
  topics,
}: {
  topic: Topic
  posts: readonly Post[]
  topics: readonly Topic[]
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
      />
      <TopicNav topics={topics} current={topic} />
      <PostList posts={posts} />
      <PostCta audience="everyone" />
    </>
  )
}
