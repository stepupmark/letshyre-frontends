import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router"

import { Container } from "@/components/section"
import { useHydrated } from "@/hooks/use-hydrated"
import { SITE } from "@/lib/seo/site"

import { NotFoundArt } from "./not-found-art"

/** The 404 body: what happened, a way home, and a way to report the link. */
export function NotFound() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const navigate = useNavigate()
  const headingRef = useRef<HTMLHeadingElement>(null)
  // the prerendered page doesn't know the real URL, so wait for the browser
  const hydrated = useHydrated()
  const canGoBack =
    hydrated &&
    ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0
  const report = `mailto:${SITE.email}?subject=${encodeURIComponent(
    t("notFound.reportSubject")
  )}&body=${encodeURIComponent(hydrated ? location.href : "")}`

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <Container className="grid items-center gap-10 py-12 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
      <div className="flex flex-col items-start gap-5">
        <p className="rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground">
          {t("notFound.label")}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-4xl/[1.1] font-semibold tracking-tight text-balance outline-none sm:text-5xl/[1.05]"
        >
          {t("notFound.title")}
        </h1>
        <p className="max-w-lg text-lg/[1.55] text-pretty text-muted-foreground">
          {t("notFound.body")}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            to={localePath(lang)}
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
        </div>
        <p className="text-sm text-muted-foreground">
          <Trans
            t={t}
            i18nKey="notFound.report"
            components={{
              report: <Link to={report} className="text-link" />,
            }}
          />
        </p>
      </div>
      <NotFoundArt className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none" />
    </Container>
  )
}
