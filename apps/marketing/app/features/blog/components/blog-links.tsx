import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { BookmarkIcon, BookOpenIcon, CalendarIcon, RssIcon } from "lucide-react"
import { Link } from "react-router"

import { archivePath, feedPath, glossaryPath } from "@/lib/blog/paths"

export function BlogLinks({
  glossary,
  saved,
  onSavedChange,
}: {
  glossary: boolean
  saved: boolean
  onSavedChange: (saved: boolean) => void
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const links = [
    { to: archivePath, label: t("index.archive"), Icon: CalendarIcon },
    ...(glossary
      ? [{ to: glossaryPath, label: t("index.glossary"), Icon: BookOpenIcon }]
      : []),
  ]

  return (
    <nav
      aria-label={t("index.browse")}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5"
    >
      {links.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={localePath(lang, to)}
          prefetch="intent"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-foreground/75 transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
        >
          <Icon aria-hidden className="size-4" />
          {label}
        </Link>
      ))}
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => {
          onSavedChange(!saved)
        }}
        className="group inline-flex items-center gap-1.5 rounded-sm text-sm text-foreground/75 transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:font-medium aria-pressed:text-brand-text motion-reduce:transition-none"
      >
        <BookmarkIcon
          aria-hidden
          className="size-4 group-aria-pressed:fill-current"
        />
        {t("index.saved")}
      </button>
      <a
        href={localePath(lang, feedPath)}
        type="application/rss+xml"
        title={t("index.feed")}
        className="inline-flex items-center gap-1.5 rounded-sm text-sm text-foreground/75 transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
      >
        <RssIcon aria-hidden className="size-4" />
        <span className="max-sm:sr-only">{t("index.feed")}</span>
      </a>
    </nav>
  )
}
