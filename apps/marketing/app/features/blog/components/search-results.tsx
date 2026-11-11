import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { BookmarkIcon, SearchXIcon, WifiOffIcon, XIcon } from "lucide-react"
import { use, useId, useState } from "react"

import type { Length } from "@/lib/blog/list"
import { searchPosts, searchWords } from "@/lib/blog/search"

import { useDebounced } from "../hooks/use-debounced"
import { loadSearchIndex } from "../lib/search-index"
import { PostGrid } from "./post-list"

export default function SearchResults({
  query,
  length,
  saved,
  onClear,
}: {
  query: string
  length: Length | undefined
  /** Show only these posts, in this order: the reader's saved ones. */
  saved?: readonly string[]
  onClear: () => void
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const titleId = useId()
  const [, setAttempt] = useState(0)
  const index = use(loadSearchIndex(lang))
  const base = saved
    ? saved.flatMap((slug) => index?.find((post) => post.slug === slug) ?? [])
    : (index ?? [])
  const posts =
    saved && !query && !length
      ? base
      : searchPosts(base, query, lang, (topic) => t(`topics.${topic}`), length)
  // announced once typing pauses, not on every key
  const announced = useDebounced(posts.length, 400)

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-6">
      <h2 id={titleId} className="sr-only">
        {t("index.resultsTitle")}
      </h2>
      <div
        className={
          index && posts.length > 0
            ? "flex items-center justify-between gap-4"
            : "contents"
        }
      >
        <p
          role="status"
          className={
            index && posts.length > 0
              ? "text-sm text-muted-foreground tabular-nums"
              : "sr-only"
          }
        >
          {index && t("index.results", { count: announced })}
        </p>
        {index && posts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="-me-2.5"
          >
            <XIcon aria-hidden />
            {t("index.clearFilters")}
          </Button>
        )}
      </div>
      {!index ? (
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WifiOffIcon aria-hidden />
            </EmptyMedia>
            <EmptyTitle className="text-base">
              {t("index.searchFailed")}
            </EmptyTitle>
          </EmptyHeader>
          <Button
            variant="outline"
            onClick={() => {
              setAttempt((n) => n + 1)
            }}
          >
            {t("index.retry")}
          </Button>
        </Empty>
      ) : posts.length > 0 ? (
        <PostGrid posts={posts} highlight={searchWords(query, lang)} />
      ) : saved && base.length === 0 ? (
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookmarkIcon aria-hidden />
            </EmptyMedia>
            <EmptyTitle className="text-base">{t("saved.empty")}</EmptyTitle>
            <EmptyDescription>{t("saved.emptyHint")}</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={onClear}>
            {t("saved.browse")}
          </Button>
        </Empty>
      ) : (
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon aria-hidden />
            </EmptyMedia>
            <EmptyTitle className="text-base">
              {query
                ? t("index.noResults", { query })
                : t("index.noLengthResults")}
            </EmptyTitle>
            <EmptyDescription>{t("index.noResultsHint")}</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={onClear}>
            {t("index.clear")}
          </Button>
        </Empty>
      )}
    </section>
  )
}
