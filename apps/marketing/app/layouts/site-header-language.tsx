import { LanguageSwitcher } from "@workspace/blocks/language-switcher"
import { LOCALES, localePath, writeLocaleCookie } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import type { ComponentProps } from "react"

import { usePageLocales } from "@/hooks/use-page-locales"
import { env } from "@/lib/env"

type Props = Pick<
  ComponentProps<typeof LanguageSwitcher>,
  "display" | "side" | "className"
>

/** Lists the locales this page is published in, or every home when there's no page (the 404). */
export function SiteLanguageSwitcher(props: Props) {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const { locales, path } = usePageLocales()

  return (
    <LanguageSwitcher
      {...props}
      current={lang}
      locales={locales.length ? locales : LOCALES}
      label={t("nav.language")}
      searchLabel={t("nav.searchLanguage")}
      emptyLabel={t("nav.noLanguage")}
      hrefFor={(l) => localePath(l, path)}
      onSelect={(l) => {
        writeLocaleCookie(l, { domain: env.VITE_COOKIE_DOMAIN })
      }}
    />
  )
}
