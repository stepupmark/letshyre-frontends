import { Trans, useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Link, useNavigate } from "react-router"

import { StatusPage } from "@/components/status-page"
import { useHydrated } from "@/hooks/use-hydrated"
import { usePagePath } from "@/hooks/use-page-path"
import { reportHref } from "@/lib/report-href"

import { NotFoundArt } from "./not-found-art"

export function NotFound() {
  const { t } = useTranslation("common")
  const pagePath = usePagePath()
  const navigate = useNavigate()
  // the prerendered page doesn't know the real URL, so wait for the browser
  const hydrated = useHydrated()
  const canGoBack =
    hydrated &&
    ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0
  const report = reportHref(
    t("notFound.reportSubject"),
    hydrated ? location.href : ""
  )

  return (
    <StatusPage
      label={t("notFound.label")}
      title={t("notFound.title")}
      body={t("notFound.body")}
      actions={
        <>
          <Link
            to={pagePath("home")}
            className={buttonVariants({ size: "lg" })}
          >
            {t("notFound.goHome")}
          </Link>
          {canGoBack && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                void navigate(-1)
              }}
            >
              {t("notFound.goBack")}
            </Button>
          )}
        </>
      }
      footer={
        <p className="text-sm text-muted-foreground">
          <Trans
            t={t}
            i18nKey="notFound.report"
            components={{
              report: <Link to={report} className="text-link" />,
            }}
          />
        </p>
      }
      art={
        <NotFoundArt className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none" />
      }
    />
  )
}
