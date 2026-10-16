import { useLocale, useTranslation } from "@workspace/i18n/react"
import { BookOpen } from "lucide-react"

import { guideChapter, type GuideChapter } from "@/lib/site"

/** Links a page to the guide chapter that explains it. */
export function GuideLink({ chapter }: { chapter: GuideChapter }) {
  const { t } = useTranslation("common")
  const locale = useLocale()

  return (
    <a
      href={guideChapter(locale, chapter)}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <BookOpen aria-hidden className="size-4" />
      {t("empty.guide")}
      <span className="sr-only">{t("empty.newTab")}</span>
    </a>
  )
}
