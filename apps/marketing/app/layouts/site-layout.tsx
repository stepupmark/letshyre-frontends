import { NavigationProgress } from "@workspace/blocks/navigation-progress"
import { SkipLink } from "@workspace/blocks/skip-link"
import { I18nProvider, useTranslation } from "@workspace/i18n/react"
import {
  Outlet,
  type ShouldRevalidateFunctionArgs,
  useMatches,
  useRouteLoaderData,
} from "react-router"

import { ConsentGate } from "@/components/consent-gate"
import { RouteError } from "@/components/route-error"
import { layoutData } from "@/lib/page-data.server"
import { collectMessages } from "@/lib/seo/page-meta"

import type { Route } from "./+types/site-layout"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export const loader = ({ params }: Route.LoaderArgs) => layoutData(params.lang)

export const shouldRevalidate = ({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) =>
  currentParams.lang !== nextParams.lang && defaultShouldRevalidate

function Chrome({ children }: { children: React.ReactNode }) {
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

export default function SiteLayout({ loaderData }: Route.ComponentProps) {
  // layout copy plus whatever the matched page loaded
  const messages = collectMessages(useMatches())

  return (
    <I18nProvider lang={loaderData.lang} messages={messages}>
      <Chrome>
        <Outlet />
      </Chrome>
    </I18nProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const data = useRouteLoaderData<typeof loader>("layouts/site-layout")
  if (!data) throw error

  return (
    <I18nProvider lang={data.lang} messages={data.messages}>
      <Chrome>
        <RouteError error={error} />
      </Chrome>
    </I18nProvider>
  )
}
