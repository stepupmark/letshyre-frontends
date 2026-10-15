import { useLocale, useTranslation } from "@workspace/i18n/react"

import type { Notice } from "../lib/profile-format"

export function useYearsText(years: number | null | undefined) {
  const { t } = useTranslation("candidate")
  if (years == null) return null
  if (years === 0) return t("profile.fresher")
  return t("profile.years", { count: Math.round(years * 10) / 10 })
}

export function useNoticeText(notice: Notice) {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  switch (notice.kind) {
    case "unknown":
      return null
    case "now":
      return t("profile.immediate")
    case "text":
      return notice.text
    case "days":
      return t("profile.notice", {
        count: notice.days,
        formatted: new Intl.NumberFormat(locale).format(notice.days),
      })
  }
}
