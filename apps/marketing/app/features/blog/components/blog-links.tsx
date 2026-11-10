import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { BookmarkIcon, BookOpenIcon, CalendarIcon } from "lucide-react"
import { Link } from "react-router"

import { archivePath, glossaryPath } from "@/lib/blog/paths"

import { FeedLink } from "./feed-link"

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
      className="flex flex-wrap items-center gap-x-5 gap-y-2"
    >
      {links.map(({ to, label, Icon }) => (
        <Link
          key={to}
          to={localePath(lang, to)}
          prefetch="intent"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-text underline-offset-4 hover:underline"
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
        className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:underline"
      >
        <BookmarkIcon aria-hidden className="size-4" />
        {t("index.saved")}
      </button>
      <FeedLink />
    </nav>
  )
}
