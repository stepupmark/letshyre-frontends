import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"

/** The posts either side of this one in its topic, older on the start side. */
export function PostNeighbours({
  older,
  newer,
}: {
  older?: Pick<Post, "slug" | "title">
  newer?: Pick<Post, "slug" | "title">
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  if (!older && !newer) return null

  return (
    <nav
      aria-label={t("post.neighbours")}
      className="grid max-w-prose gap-3 sm:grid-cols-2 print:hidden"
    >
      {older && (
        <Link
          to={localePath(lang, postPath(older.slug))}
          prefetch="intent"
          rel="prev"
          className="group flex flex-col gap-1 rounded-xl border p-4 transition-colors duration-200 outline-none hover:border-brand/40 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
        >
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <ArrowLeftIcon aria-hidden className="size-4 rtl:-scale-x-100" />
            {t("post.older")}
          </span>
          <span className="font-medium text-balance text-foreground group-hover:text-brand-text">
            {older.title}
          </span>
        </Link>
      )}
      {newer && (
        <Link
          to={localePath(lang, postPath(newer.slug))}
          prefetch="intent"
          rel="next"
          className="group flex flex-col items-end gap-1 rounded-xl border p-4 text-end transition-colors duration-200 outline-none hover:border-brand/40 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none sm:col-start-2"
        >
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            {t("post.newer")}
            <ArrowRightIcon aria-hidden className="size-4 rtl:-scale-x-100" />
          </span>
          <span className="font-medium text-balance text-foreground group-hover:text-brand-text">
            {newer.title}
          </span>
        </Link>
      )}
    </nav>
  )
}
