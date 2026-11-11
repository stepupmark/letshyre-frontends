import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Fragment } from "react"
import { Link } from "react-router"

import { PAGES } from "@/lib/pages"

/** "Blog", then the pages above this one; an item without `to` is the current page. */
export function BlogCrumbs({
  trail = [],
}: {
  trail?: readonly { label: string; to?: string }[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <>
      <Link to={localePath(lang, PAGES.blog.path)} className="hover:underline">
        {t("index.eyebrow")}
      </Link>
      {trail.map(({ label, to }) => (
        <Fragment key={label}>
          <span aria-hidden className="mx-2 text-muted-foreground">
            /
          </span>
          {to ? (
            <Link to={localePath(lang, to)} className="hover:underline">
              {label}
            </Link>
          ) : (
            label
          )}
        </Fragment>
      ))}
    </>
  )
}
