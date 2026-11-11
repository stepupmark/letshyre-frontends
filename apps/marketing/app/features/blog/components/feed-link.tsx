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
      className="inline-flex items-center gap-1.5 rounded-sm text-sm text-foreground/75 transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
    >
      <RssIcon aria-hidden className="size-4" />
      {t("index.feed")}
    </a>
  )
}
