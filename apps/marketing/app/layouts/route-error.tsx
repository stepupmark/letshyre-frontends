import { ErrorScreen, errorDetails } from "@workspace/blocks/error-screen"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { isRouteErrorResponse, Link } from "react-router"

import { NotFound } from "@/features/not-found"

/** Body of every ErrorBoundary. Needs an I18nProvider with `common` loaded. */
export function RouteError({ error }: { error: unknown }) {
  const { t } = useTranslation("common")
  const home = localePath(useLocale())

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />

  const details = import.meta.env.DEV ? errorDetails(error) : undefined

  return (
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
        className={buttonVariants({ size: "lg", variant: "outline" })}
      >
        {t("error.goHome")}
      </Link>
    </ErrorScreen>
  )
}
