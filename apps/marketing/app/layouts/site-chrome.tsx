import { NavigationProgress } from "@workspace/blocks/navigation-progress"
import { SkipLink } from "@workspace/blocks/skip-link"
import { useTranslation } from "@workspace/i18n/react"
import type { ReactNode } from "react"

import { ConsentGate } from "@/components/consent-gate"

import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

/** Header, main and footer around a page. Needs an I18nProvider with `common`. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const { t } = useTranslation("common")

  return (
    <>
      <SkipLink>{t("skipToContent")}</SkipLink>
      <NavigationProgress label={t("pageState.loading")} />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <ConsentGate />
    </>
  )
}
