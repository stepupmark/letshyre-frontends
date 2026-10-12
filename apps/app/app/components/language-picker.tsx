import { LanguageSwitcher } from "@workspace/blocks/language-switcher"
import { useTranslation } from "@workspace/i18n/react"
import { useLocation } from "react-router"

import { APP_LOCALES, locale, rememberLocale } from "@/lib/i18n"

/** The language menu for pages outside the dashboard; picking one reloads the page. */
export function LanguagePicker({ className }: { className?: string }) {
  const { t } = useTranslation("shell")
  const { pathname, search } = useLocation()

  if (APP_LOCALES.length < 2) return null

  return (
    <LanguageSwitcher
      current={locale}
      locales={APP_LOCALES}
      label={t("user.language")}
      searchLabel={t("user.searchLanguage")}
      emptyLabel={t("user.noLanguage")}
      hrefFor={() => pathname + search}
      onSelect={rememberLocale}
      display="code"
      className={className}
    />
  )
}
