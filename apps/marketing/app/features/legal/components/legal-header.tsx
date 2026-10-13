import { useFormat, useTranslation } from "@workspace/i18n/react"
import { CalendarIcon, ClockIcon } from "lucide-react"

import { PageHeader } from "@/components/section"

import type { LegalNamespace } from "../lib/legal-doc"

export function LegalHeader({
  ns,
  title,
  updated,
  minutes,
}: {
  ns: LegalNamespace
  title: string
  updated: string
  minutes: number
}) {
  const { t } = useTranslation(ns)
  const { t: tc } = useTranslation("common")
  const format = useFormat()

  return (
    <PageHeader eyebrow={tc("footer.legal")} title={title}>
      <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon aria-hidden className="size-4 text-brand" />
          <time dateTime={updated}>
            {t("chrome.lastUpdated", {
              date: format.date(updated, { dateStyle: "long" }),
            })}
          </time>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon aria-hidden className="size-4 text-brand" />
          {t("chrome.readTime", { count: minutes })}
        </span>
      </p>
    </PageHeader>
  )
}
