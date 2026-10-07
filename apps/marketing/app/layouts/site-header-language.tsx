import { LanguageSwitcher } from "@workspace/blocks/language-switcher"
import { localePath, writeLocaleCookie } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import type { ComponentProps } from "react"

import { usePageLocales } from "@/hooks/use-page-locales"
import { env } from "@/lib/env"

type Props = Pick<
  ComponentProps<typeof LanguageSwitcher>,
  "display" | "side" | "className"
>

/** Lists only the locales this page is published in. Used by the header and footer. */
export function SiteLanguageSwitcher(props: Props) {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const { locales, path } = usePageLocales()

  return (
    <LanguageSwitcher
      {...props}
      current={lang}
      locales={locales.length ? locales : [lang]}
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
