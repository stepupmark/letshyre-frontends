import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { RssIcon } from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { postPath, seriesFeedPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"

/** A series' parts, and its feed, which tells followers when the next part is out. */
export function PostSeries({
  slug,
  parts,
  series,
}: {
  slug: string
  parts: readonly Pick<Post, "slug" | "title">[]
  series?: string
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const titleId = useId()
  if (!series) return null
  const at = parts.findIndex((part) => part.slug === slug)

  return (
    <nav
      aria-labelledby={titleId}
      className="flex max-w-prose flex-col gap-3 rounded-xl border p-5 print:hidden"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={titleId} className="text-sm font-medium text-muted-foreground">
          {parts.length > 1
            ? t("post.seriesPart", { part: at + 1, count: parts.length })
            : t("post.seriesFirst")}
        </h2>
        <a
          href={localePath(lang, seriesFeedPath(series))}
          type="application/rss+xml"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-text underline-offset-4 hover:underline"
        >
          <RssIcon aria-hidden className="size-4" />
          {t("post.followSeries")}
        </a>
      </div>
      {parts.length > 1 && (
        <ol className="flex list-decimal flex-col gap-1.5 ps-5 text-sm marker:text-muted-foreground marker:tabular-nums">
          {parts.map((part) => (
            <li key={part.slug} className="ps-1">
              {part.slug === slug ? (
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {part.title}
                </span>
              ) : (
                <Link
                  to={localePath(lang, postPath(part.slug))}
                  prefetch="intent"
                  className="text-link"
                >
                  {part.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}
