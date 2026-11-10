import { useTranslation } from "@workspace/i18n/react"
import { use, useId } from "react"

import type { Source } from "@/lib/blog/post"

import { SourcesContext } from "../lib/sources"

/** The source's number in the list at the end of the post, as a link down to it. */
export function SourceMark({ url }: { url: string }) {
  const { t } = useTranslation("blog")
  const sources = use(SourcesContext)
  const n = sources.findIndex((source) => source.url === url) + 1
  if (n === 0) return null
  return (
    <sup className="ms-0.5 text-xs">
      <a
        href={`#source-${n}`}
        aria-label={t("post.sourceMark", { n })}
        className="relative text-muted-foreground tabular-nums no-underline after:absolute after:-inset-2 hover:text-foreground"
      >
        {n}
      </a>
    </sup>
  )
}

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "")

export function PostSources({ sources }: { sources: readonly Source[] }) {
  const { t } = useTranslation("blog")
  const titleId = useId()
  if (sources.length === 0) return null

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 border-t pt-8"
    >
      <h2 id={titleId} className="text-lg font-semibold tracking-tight">
        {t("post.sources")}
      </h2>
      <ol className="flex list-decimal flex-col gap-2 ps-6 text-sm text-muted-foreground">
        {sources.map((source, i) => (
          <li
            key={source.url}
            id={`source-${i + 1}`}
            className="ps-1 tabular-nums"
          >
            <a
              href={source.url}
              rel="noopener"
              className="text-link wrap-break-word"
            >
              {source.title ?? hostOf(source.url)}
            </a>
            <span className="ms-2 text-pretty">
              {source.title
                ? hostOf(source.url)
                : t("post.sourceQuote", { text: source.linkText })}
            </span>
            <span className="hidden break-all print:block">{source.url}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
