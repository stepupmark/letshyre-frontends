import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { RssIcon } from "lucide-react"

import { PageHeader } from "@/components/section"
import { feedPath } from "@/lib/blog/paths"
import type { Post, Topic } from "@/lib/blog/post"

import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"
import { TopicNav } from "./components/topic-nav"

export function BlogIndexPage({
  posts,
  topics,
}: {
  posts: readonly Post[]
  topics: readonly Topic[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <>
      <PageHeader
        variant="masthead"
        eyebrow={t("index.eyebrow")}
        title={t("index.title")}
        description={t("index.description")}
      >
        <a
          href={localePath(lang, feedPath)}
          type="application/rss+xml"
          className="text-link inline-flex items-center gap-2 text-sm font-medium"
        >
          <RssIcon aria-hidden className="size-4" />
          {t("index.feed")}
        </a>
      </PageHeader>
      <TopicNav topics={topics} />
      <PostList posts={posts} />
      <PostCta audience="everyone" />
    </>
  )
}
