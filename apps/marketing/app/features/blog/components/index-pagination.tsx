import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { ArrowLeftIcon, ArrowRightIcon, EllipsisIcon } from "lucide-react"
import { Link } from "react-router"

import { pageWindow } from "@/lib/blog/list"
import { indexPagePath } from "@/lib/blog/paths"

export function IndexPagination({
  page,
  pages,
}: {
  page: number
  pages: number
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  if (pages < 2) return null

  const to = (n: number) => localePath(lang, indexPagePath(n))

  return (
    <nav
      aria-label={t("index.pages")}
      className="grid grid-cols-2 items-center gap-4 border-t pt-8 sm:grid-cols-3 print:hidden"
    >
      {page > 1 ? (
        <Link
          to={to(page - 1)}
          rel="prev"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "justify-self-start",
          })}
        >
          <ArrowLeftIcon aria-hidden className="rtl:-scale-x-100" />
          {t("index.newer")}
        </Link>
      ) : null}
      <ol className="col-span-2 row-start-2 flex items-center justify-center gap-1 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        {pageWindow(page, pages).map((n, i) =>
          n === 0 ? (
            <li
              key={`gap-${i}`}
              aria-hidden
              className="grid size-9 place-items-center text-muted-foreground"
            >
              <EllipsisIcon className="size-4" />
            </li>
          ) : (
            <li key={n}>
              <Link
                to={to(n)}
                aria-label={t("index.page", { page: n })}
                aria-current={n === page ? "page" : undefined}
                className={buttonVariants({
                  variant: n === page ? "secondary" : "ghost",
                  size: "icon-lg",
                  className: "tabular-nums",
                })}
              >
                {n}
              </Link>
            </li>
          )
        )}
      </ol>
      {page < pages ? (
        <Link
          to={to(page + 1)}
          rel="next"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "col-start-2 justify-self-end sm:col-start-3",
          })}
        >
          {t("index.older")}
          <ArrowRightIcon aria-hidden className="rtl:-scale-x-100" />
        </Link>
      ) : null}
    </nav>
  )
}
