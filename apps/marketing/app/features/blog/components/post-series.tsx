import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"

export function PostSeries({
  slug,
  parts,
}: {
  slug: string
  parts: readonly Pick<Post, "slug" | "title">[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const titleId = useId()
  if (parts.length === 0) return null
  const at = parts.findIndex((part) => part.slug === slug)

  return (
    <nav
      aria-labelledby={titleId}
      className="flex max-w-prose flex-col gap-3 rounded-xl border p-5 print:hidden"
    >
      <h2 id={titleId} className="text-sm font-medium text-muted-foreground">
        {t("post.seriesPart", { part: at + 1, count: parts.length })}
      </h2>
      <ol className="flex list-decimal flex-col gap-1.5 ps-5 text-sm marker:text-muted-foreground marker:tabular-nums">
        {parts.map((part) => (
          <li key={part.slug} className="ps-1">
            {part.slug === slug ? (
              <span aria-current="page" className="font-medium text-foreground">
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
    </nav>
  )
}
