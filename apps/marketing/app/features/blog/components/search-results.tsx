import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { SearchXIcon } from "lucide-react"

import type { PostSummary } from "@/lib/blog/search"

import { PostGrid } from "./post-list"

export function SearchResults({
  query,
  posts,
  onClear,
}: {
  query: string
  posts: readonly PostSummary[]
  onClear: () => void
}) {
  const { t } = useTranslation("blog")

  return (
    <section aria-label={t("index.search")} className="flex flex-col gap-6">
      <p
        role="status"
        className={
          posts.length > 0 ? "text-sm text-muted-foreground" : "sr-only"
        }
      >
        {t("index.results", { count: posts.length })}
      </p>
      {posts.length > 0 ? (
        <PostGrid posts={posts} />
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
