import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { lazy, Suspense } from "react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import { LENGTHS, type Length } from "@/lib/blog/list"
import type { PostSummary, Topic } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { BlogLinks } from "./components/blog-links"
import { IndexPagination } from "./components/index-pagination"
import { LengthFilter } from "./components/length-filter"
import { PendingList } from "./components/pending-list"
import { PostCta } from "./components/post-cta"
import { PostList } from "./components/post-list"
import { PostSearch } from "./components/post-search"
import { TopicNav } from "./components/topic-nav"
import { useUrlParam } from "./hooks/use-url-param"
import { savedPosts } from "./lib/reader"

// loads, with the search index, only once someone searches
const SearchResults = lazy(() => import("./components/search-results"))

export function BlogIndexPage({
  posts,
  page,
  pages,
  topics,
  glossary,
  lengths,
}: {
  posts: readonly PostSummary[]
  page: number
  pages: number
  topics: readonly { topic: Topic; count: number }[]
  glossary: boolean
  lengths: readonly Length[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const [query, setQuery] = useUrlParam("q")
  const [lengthParam, setLength] = useUrlParam("length")
  const [savedParam, setSaved] = useUrlParam("saved")
  const length = LENGTHS.find((l) => l === lengthParam)
  const showSaved = savedParam === "1"
  const saved = savedPosts(lang).useValue()
  const searching = query.trim() !== "" || length !== undefined || showSaved

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
        <LengthFilter
          lengths={lengths}
          value={length}
          onChange={(next: Length | undefined) => {
            setLength(next ?? "")
          }}
        />
        <BlogLinks
          glossary={glossary}
          saved={showSaved}
          onSavedChange={(on) => {
            setSaved(on ? "1" : "")
          }}
        />
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
              length={length}
              saved={showSaved ? (saved ?? []) : undefined}
              onClear={() => {
                setQuery("")
                setLength("")
                setSaved("")
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
