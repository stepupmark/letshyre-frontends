import { LanguageSwitcher } from "@workspace/blocks/language-switcher"
import { localePath, writeLocaleCookie } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"

import { usePageLocales } from "@/hooks/use-page-locales"
import { env } from "@/lib/env"

/** Lists only the locales this page is published in. Used by the header and footer. */
export function SiteLanguageSwitcher() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const { locales, path } = usePageLocales()

  return (
    <LanguageSwitcher
      current={lang}
      locales={locales.length ? locales : [lang]}
      label={t("nav.language")}
      hrefFor={(l) => localePath(l, path)}
      onSelect={(l) => {
        writeLocaleCookie(l, { domain: env.VITE_COOKIE_DOMAIN })
      }}
    />
  )
}
