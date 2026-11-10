import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { lazy, Suspense } from "react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import type { PostSummary, Topic } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { FeedLink } from "./components/feed-link"
import { IndexPagination } from "./components/index-pagination"
import { PendingList } from "./components/pending-list"
import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"
import { PostSearch } from "./components/post-search"
import { TopicNav } from "./components/topic-nav"
import { useSearchQuery } from "./hooks/use-search-query"

// loads, with the search index, only once someone searches
const SearchResults = lazy(() => import("./components/search-results"))

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
  const [query, setQuery] = useSearchQuery()
  const searching = query.trim() !== ""

  return (
    <>
      <PageHeader
        variant="masthead"
        eyebrow={
          page === 1 ? (
            t("index.eyebrow")
          ) : (
            <>
              <Link
                to={localePath(lang, PAGES.blog.path)}
                className="hover:underline"
              >
                {t("index.eyebrow")}
              </Link>
              <span aria-hidden className="mx-2 text-muted-foreground">
                /
              </span>
              {t("index.page", { page })}
            </>
          )
        }
        title={page === 1 ? t("index.title") : t("index.pageTitle", { page })}
        description={t("index.description")}
      >
        <PostSearch query={query} onQueryChange={setQuery} />
        <FeedLink />
      </PageHeader>
      <TopicNav topics={topics} />
      <Container className="flex flex-col gap-12 py-10 sm:py-14">
        {searching ? (
          <Suspense
            fallback={
              <p role="status" className="text-sm text-muted-foreground">
                {t("index.searching")}
              </p>
            }
          >
            <SearchResults
              query={query.trim()}
              onClear={() => {
                setQuery("")
              }}
            />
          </Suspense>
        ) : (
          <>
            <PendingList>
              <PostList posts={posts} lead={page === 1} />
            </PendingList>
            <IndexPagination page={page} pages={pages} />
          </>
        )}
      </Container>
      <PostCta audience="everyone" />
    </>
  )
}
