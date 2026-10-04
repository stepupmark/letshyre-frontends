import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { StatusBadge } from "@/components/status-badge"

import { LOW_CREDITS } from "./queries"

export function CreditsCard({
  available,
  usedPercent,
}: {
  available: number | undefined
  usedPercent: number | null | undefined
}) {
  const { t } = useTranslation("dashboard")
  const locale = useLocale()
  const used = Math.round(Math.min(100, Math.max(0, usedPercent ?? 0)))

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("credits.heading")}</CardDescription>
        <CardTitle className="flex items-baseline gap-2 text-3xl font-semibold">
          {available === undefined ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <AnimatedNumber value={available} locale={locale} />
          )}
          {available !== undefined && available <= LOW_CREDITS && (
            <StatusBadge tone="warning">{t("credits.low")}</StatusBadge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <p className="text-muted-foreground">{t("credits.explain")}</p>
        {usedPercent !== null && usedPercent !== undefined && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground tabular-nums">
              {t("credits.used", { percent: used })}
            </p>
            <Progress
              value={used}
              aria-label={t("credits.used", { percent: used })}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <AppLink
          to="/employer/billing"
          className={buttonVariants({ className: "flex-1" })}
        >
          {t("credits.add")}
        </AppLink>
        <AppLink
          to="/employer/invoice"
          className={buttonVariants({ variant: "ghost" })}
        >
          {t("credits.invoices")}
        </AppLink>
      </CardFooter>
    </Card>
  )
}
