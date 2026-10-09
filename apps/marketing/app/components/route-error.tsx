import {
  ErrorScreen,
  errorDetails,
  NotFoundScreen,
} from "@workspace/blocks/error-screen"
import { LOCALE_NAMES, LOCALES, localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { useId } from "react"
import { isRouteErrorResponse, Link } from "react-router"

function LocaleHomes() {
  const { t } = useTranslation("common")
  const labelId = useId()

  return (
    <nav aria-labelledby={labelId} className="flex flex-col items-center gap-3">
      <p id={labelId} className="text-sm text-muted-foreground">
        {t("nav.language")}
      </p>
      <ul className="flex max-w-lg flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              to={localePath(locale)}
              lang={locale}
              hrefLang={locale}
              className="rounded-sm underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {LOCALE_NAMES[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Body of every ErrorBoundary. Needs an I18nProvider with `common` loaded. */
export function RouteError({ error }: { error: unknown }) {
  const { t } = useTranslation("common")
  const home = localePath(useLocale())

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="flex flex-col items-center gap-2 pb-16">
        <NotFoundScreen
          title={t("notFound.title")}
          description={t("notFound.body")}
        >
          <Link to={home} className={buttonVariants({ size: "lg" })}>
            {t("notFound.goHome")}
          </Link>
        </NotFoundScreen>
        <LocaleHomes />
      </div>
    )
  }

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
