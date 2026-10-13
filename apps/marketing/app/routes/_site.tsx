import { I18nProvider } from "@workspace/i18n/react"
import {
  Outlet,
  type ShouldRevalidateFunctionArgs,
  useMatches,
  useRouteLoaderData,
} from "react-router"

import { RouteError } from "@/layouts/route-error"
import { SiteChrome } from "@/layouts/site-chrome"
import { layoutData } from "@/lib/page-data.server"
import { collectMessages } from "@/lib/seo/page-meta"

import type { Route } from "./+types/_site"

export const loader = ({ params }: Route.LoaderArgs) => layoutData(params.lang)

export const shouldRevalidate = ({
  currentParams,
  nextParams,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) =>
  currentParams.lang !== nextParams.lang && defaultShouldRevalidate

export default function SiteLayout({ loaderData }: Route.ComponentProps) {
  // layout copy plus whatever the matched page loaded
  const messages = collectMessages(useMatches())

  return (
    <I18nProvider lang={loaderData.lang} messages={messages}>
      <SiteChrome>
        <Outlet />
      </SiteChrome>
    </I18nProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const data = useRouteLoaderData<typeof loader>("routes/_site")
  if (!data) throw error

  return (
    <I18nProvider lang={data.lang} messages={data.messages}>
      <SiteChrome>
        <RouteError error={error} />
      </SiteChrome>
    </I18nProvider>
  )
}
