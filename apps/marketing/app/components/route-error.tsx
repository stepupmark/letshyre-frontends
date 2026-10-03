import { ErrorScreen, NotFoundScreen } from "@workspace/blocks/error-screen"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { isRouteErrorResponse, Link } from "react-router"

/** Body of every ErrorBoundary. Needs an I18nProvider with `common` loaded. */
export function RouteError({ error }: { error: unknown }) {
  const { t } = useTranslation("common")
  const home = localePath(useLocale())

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <NotFoundScreen
        title={t("notFound.title")}
        description={t("notFound.body")}
      >
        <Button nativeButton={false} render={<Link to={home} />}>
          {t("notFound.goHome")}
        </Button>
      </NotFoundScreen>
    )
  }

  return (
    <ErrorScreen
      code={isRouteErrorResponse(error) ? error.status : undefined}
      title={t("error.title")}
      description={t("error.body")}
      details={
        import.meta.env.DEV && error instanceof Error ? error.stack : undefined
      }
    >
      <Button
        onClick={() => {
          window.location.reload()
        }}
      >
        {t("error.retry")}
      </Button>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link to={home} />}
      >
        {t("error.goHome")}
      </Button>
    </ErrorScreen>
  )
}
