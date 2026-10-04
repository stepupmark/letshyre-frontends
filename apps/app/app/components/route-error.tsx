import { ErrorScreen, NotFoundScreen } from "@workspace/blocks/error-screen"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { isRouteErrorResponse, Link } from "react-router"

import { errorId } from "./error-id"

import { buttonLink } from "@/lib/button-link"

const HOME = "/employer/dashboard"

/** Body of every ErrorBoundary. Needs an I18nProvider with `common` loaded. */
export function RouteError({ error }: { error: unknown }) {
  const { t } = useTranslation("common")

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <title>{`${t("notFound.title")} · ${t("appName")}`}</title>
        <NotFoundScreen
          title={t("notFound.title")}
          description={t("notFound.body")}
        >
          <Link to={HOME} className={buttonLink({ size: "lg" })}>
            {t("notFound.goHome")}
          </Link>
        </NotFoundScreen>
      </>
    )
  }

  const id = import.meta.env.DEV ? errorId(error) : undefined
  if (id) console.error(`[error ${id}]`, error)

  return (
    <>
      <title>{`${t("error.title")} · ${t("appName")}`}</title>
      <ErrorScreen
        code={isRouteErrorResponse(error) ? error.status : undefined}
        title={t("error.title")}
        description={t("error.body")}
        details={
          id
            ? [id, error instanceof Error ? error.stack : JSON.stringify(error)]
                .filter(Boolean)
                .join("\n\n")
            : undefined
        }
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
          to={HOME}
          className={buttonLink({ size: "lg", variant: "outline" })}
        >
          {t("error.goHome")}
        </Link>
      </ErrorScreen>
    </>
  )
}
