import {
  ErrorScreen,
  errorDetails,
  NotFoundScreen,
} from "@workspace/blocks/error-screen"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { href, isRouteErrorResponse, Link, useLocation } from "react-router"

import { buttonLink } from "@/lib/button-link"

const homeFor = (pathname: string) =>
  pathname.startsWith("/employee")
    ? href("/employee/jobs")
    : href("/employer/dashboard")

/** Body of every ErrorBoundary. Needs an I18nProvider with `common` loaded. */
export function RouteError({ error }: { error: unknown }) {
  const { t } = useTranslation("common")
  const home = homeFor(useLocation().pathname)

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <title>{`${t("notFound.title")} · ${t("appName")}`}</title>
        <NotFoundScreen
          title={t("notFound.title")}
          description={t("notFound.body")}
        >
          <Link to={home} className={buttonLink({ size: "lg" })}>
            {t("notFound.goHome")}
          </Link>
        </NotFoundScreen>
      </>
    )
  }

  const details = import.meta.env.DEV ? errorDetails(error) : undefined

  return (
    <>
      <title>{`${t("error.title")} · ${t("appName")}`}</title>
      <ErrorScreen
        code={isRouteErrorResponse(error) ? error.status : undefined}
        title={t("error.title")}
        description={t("error.body")}
        details={details}
      >
        <Button
          size="lg"
          onClick={() => {
            window.location.reload()
          }}
        >
          {t("error.retry")}
        </Button>
        <Link
          to={home}
          className={buttonLink({ size: "lg", variant: "outline" })}
        >
          {t("error.goHome")}
        </Link>
      </ErrorScreen>
    </>
  )
}
