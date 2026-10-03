import { LanguageSwitcher } from "@workspace/blocks/language-switcher"
import { Logo } from "@workspace/blocks/logo"
import { localePath, writeLocaleCookie } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { usePageLocales } from "@/hooks/use-page-locales"
import { env } from "@/lib/env"

export function SiteHeader() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const { locales, path } = usePageLocales()

  return (
    <header className="border-b">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to={localePath(lang)} className="rounded-md">
          <Logo label={t("nav.logoAlt")} />
        </Link>
        <LanguageSwitcher
          current={lang}
          locales={locales.length ? locales : [lang]}
          label={t("nav.language")}
          hrefFor={(l) => localePath(l, path)}
          onSelect={(l) => {
            writeLocaleCookie(l, { domain: env.VITE_COOKIE_DOMAIN })
          }}
        />
      </Container>
    </header>
  )
}
