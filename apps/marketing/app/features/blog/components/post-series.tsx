import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"

export function PostSeries({
  series,
  current,
}: {
  series: { title: string; posts: readonly { slug: string; title: string }[] }
  current: string
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const part = series.posts.findIndex((post) => post.slug === current) + 1

  return (
    <nav
      aria-label={series.title}
      className="flex max-w-prose flex-col gap-3 rounded-xl border p-4 sm:p-5 print:hidden"
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-muted-foreground tabular-nums">
          {t("post.seriesPart", { part, total: series.posts.length })}
        </p>
        <p className="font-semibold text-balance">{series.title}</p>
      </div>
      <ol className="flex list-decimal flex-col gap-1.5 ps-5 text-sm marker:text-muted-foreground">
        {series.posts.map((post) => (
          <li key={post.slug} className="ps-1 text-pretty">
            {post.slug === current ? (
              <span aria-current="page" className="font-medium">
                {post.title}
              </span>
            ) : (
              <Link
                to={localePath(lang, postPath(post.slug))}
                prefetch="intent"
                className="rounded-sm text-muted-foreground underline-offset-4 transition-colors duration-200 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
              >
                {post.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
