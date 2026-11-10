import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { RssIcon } from "lucide-react"

import { feedPath } from "@/lib/blog/paths"

export function FeedLink() {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <a
      href={localePath(lang, feedPath)}
      type="application/rss+xml"
      className="inline-flex items-center gap-2 text-sm font-medium text-brand-text underline-offset-4 hover:underline"
    >
      <RssIcon aria-hidden className="size-4" />
      {t("index.feed")}
    </a>
  )
}
