import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useState } from "react"

import { Container, PageHeader } from "@/components/section"
import { postsOnPage, type Topic } from "@/lib/blog/post"
import { type PostSummary, searchPosts } from "@/lib/blog/search"

import { FeedLink } from "./components/feed-link"
import { IndexPagination } from "./components/index-pagination"
import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"
import { PostSearch } from "./components/post-search"
import { SearchResults } from "./components/search-results"
import { TopicNav } from "./components/topic-nav"

export function BlogIndexPage({
  posts,
  page,
  pages,
  topics,
}: {
  posts: readonly PostSummary[]
  page: number
  pages: number
  topics: readonly { topic: Topic; count: number }[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const [query, setQuery] = useState("")
  const searching = query.trim() !== ""

  return (
    <>
      <PageHeader
        variant="masthead"
        eyebrow={t("index.eyebrow")}
        title={page === 1 ? t("index.title") : t("index.pageTitle", { page })}
        description={t("index.description")}
      >
        <PostSearch query={query} onQueryChange={setQuery} />
        <FeedLink />
      </PageHeader>
      <TopicNav topics={topics} />
      <Container className="flex flex-col gap-12 py-10 sm:py-14">
        {searching ? (
          <SearchResults
            query={query.trim()}
            posts={searchPosts(posts, query, lang)}
            onClear={() => {
              setQuery("")
            }}
          />
        ) : (
          <>
            <PostList posts={postsOnPage(posts, page)} lead={page === 1} />
            <IndexPagination page={page} pages={pages} />
          </>
        )}
      </Container>
      <PostCta audience="everyone" />
    </>
  )
}
