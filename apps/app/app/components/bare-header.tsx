import { Logo } from "@workspace/blocks/logo"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import type { ReactNode } from "react"

import { LanguagePicker } from "@/components/language-picker"

export function BareHeader({
  homeHref,
  children,
}: {
  homeHref?: string
  children?: ReactNode
}) {
  const { t } = useTranslation(["shell", "common"])
  const logo = <Logo label={t("common:appName")} />

  return (
    <>
      <SkipLink>{t("shell:skipToContent")}</SkipLink>
      <header className="border-b print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {homeHref ? (
            // the marketing site, so a full page load
            <a href={homeHref} className="rounded-sm">
              {logo}
            </a>
          ) : (
            logo
          )}
          <div className="flex items-center gap-1">
            <LanguagePicker display="name" />
            {children}
          </div>
        </div>
      </header>
    </>
  )
}
