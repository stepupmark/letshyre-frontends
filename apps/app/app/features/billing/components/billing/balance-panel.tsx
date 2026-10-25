import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { FileText, TriangleAlert } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { creditsQuery, LOW_CREDITS } from "@/lib/credits"
import { duration, ease } from "@/lib/motion"

export function BalancePanel() {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const credits = useQuery(creditsQuery())
  const id = useId()
  const balance = credits.data?.available_credits
  const low = balance !== undefined && balance <= LOW_CREDITS

  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-5 rounded-lg border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id={id} className="text-sm font-medium text-muted-foreground">
          {t("balancePanel.label")}
        </h2>
        {balance !== undefined ? (
          <p className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-brand-text">
              <AnimatedNumber value={balance} from={0} locale={locale} />
            </span>
            <span className="text-base text-muted-foreground">
              {t("balancePanel.unit", { count: balance })}
            </span>
          </p>
        ) : credits.isError ? (
          <p className="py-2 text-sm text-muted-foreground">
            {t("balancePanel.error")}
          </p>
        ) : (
          <Skeleton className="my-1 h-8 w-28" />
        )}
        <AnimatePresence initial={false} mode="wait">
          <m.p
            key={low ? "low" : "ok"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base, ease }}
            className="flex items-center gap-1.5 text-sm text-pretty text-muted-foreground data-[low=true]:font-medium data-[low=true]:text-warning"
            data-low={low}
          >
            {low && <TriangleAlert className="size-4 shrink-0" aria-hidden />}
            {low ? t("balancePanel.low") : t("balancePanel.body")}
          </m.p>
        </AnimatePresence>
      </div>
      <AppLink
        to={href("/employer/invoices")}
        className={buttonLink({
          variant: "outline",
          size: "lg",
          className: "max-sm:w-full",
        })}
      >
        <FileText />
        {t("invoices")}
      </AppLink>
    </section>
  )
}
