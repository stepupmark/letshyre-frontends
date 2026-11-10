import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import type { PostSummary, Tag } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { FeedLink } from "./components/feed-link"
import { PendingList } from "./components/pending-list"
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
  const lang = useLocale()
  const name = t(`tags.${tag}`)

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
    </>
  )
}
