import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { SearchXIcon, WifiOffIcon } from "lucide-react"
import { use, useId, useState } from "react"

import { searchPosts, searchWords } from "@/lib/blog/search"

import { useDebounced } from "../hooks/use-debounced"
import { loadSearchIndex } from "../lib/search-index"
import { PostGrid } from "./post-list"

export default function SearchResults({
  query,
  onClear,
}: {
  query: string
  onClear: () => void
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const titleId = useId()
  const [, setAttempt] = useState(0)
  const index = use(loadSearchIndex(lang))
  const posts = searchPosts(index ?? [], query, lang, (topic) =>
    t(`topics.${topic}`)
  )
  // announced once typing pauses, not on every key
  const announced = useDebounced(posts.length, 400)

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-6">
      <h2 id={titleId} className="sr-only">
        {t("index.resultsTitle")}
      </h2>
      <p
        role="status"
        className={
          index && posts.length > 0
            ? "text-sm text-muted-foreground"
            : "sr-only"
        }
      >
        {index && t("index.results", { count: announced })}
      </p>
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
      ) : (
        <Empty className="border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon aria-hidden />
            </EmptyMedia>
            <EmptyTitle className="text-base">
              {t("index.noResults", { query })}
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
