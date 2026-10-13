import { errorDetails, errorId } from "@workspace/blocks/error-screen"
import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { isRouteErrorResponse, Link } from "react-router"

import { StatusPage } from "@/components/status-page"
import { NotFound } from "@/features/not-found"
import { useHydrated } from "@/hooks/use-hydrated"
import { reportHref } from "@/lib/report-href"

import { RouteErrorArt } from "./route-error-art"

/** Body of every ErrorBoundary. Needs an I18nProvider with `common` loaded. */
export function RouteError({ error }: { error: unknown }) {
  const { t } = useTranslation("common")
  const home = localePath(useLocale())
  const hydrated = useHydrated()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />

  const id = errorId(error)
  // the id is already on the page, so the box only needs the trace
  const details = import.meta.env.DEV
    ? errorDetails(error).slice(id.length).trim()
    : undefined
  const report = reportHref(
    t("error.reportSubject"),
    `${t("error.reference", { id })}\n${hydrated ? location.href : ""}`
  )

  return (
    <StatusPage
      label={t("error.label")}
      title={t("error.title")}
      body={t("error.body")}
      actions={
        <>
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
        </>
      }
      footer={
        <div className="flex w-full flex-col gap-3 text-sm text-muted-foreground">
          <p>
            <Trans
              t={t}
              i18nKey="error.report"
              components={{
                report: <Link to={report} className="text-link" />,
              }}
            />{" "}
            <span className="font-mono text-xs">
              {t("error.reference", { id })}
            </span>
          </p>
          {details && (
            <details className="w-full rounded-lg border bg-muted/40">
              <summary className="cursor-pointer px-4 py-2.5 font-medium text-foreground">
                {t("error.details")}
              </summary>
              <pre className="max-h-48 overflow-auto border-t px-4 py-3 text-xs wrap-break-word whitespace-pre-wrap">
                {details}
              </pre>
            </details>
          )}
        </div>
      }
      art={
        <RouteErrorArt className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none" />
      }
    />
  )
}
