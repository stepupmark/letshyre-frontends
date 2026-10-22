import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { Coins, FileText, Undo2 } from "lucide-react"
import { useId, useState } from "react"
import { href, useLocation, useNavigate, useSearchParams } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { buttonLink } from "@/lib/button-link"
import { creditsQuery } from "@/lib/credits"

import {
  CHECKOUT,
  checkoutItem,
  NEXT,
  paidPlans,
  safeNext,
  topUpKey,
} from "../../lib/checkout"
import { creditPriceQuery, plansQuery } from "../../queries/billing.queries"
import { CheckoutDialog } from "../checkout/checkout-dialog"
import { PlanCard, PlanSkeleton } from "./plan-card"
import { TopUpPicker } from "./top-up-picker"
import { UnavailableDialog } from "./unavailable-dialog"

export function Billing() {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const [search, setSearch] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const plans = useQuery(plansQuery())
  const price = useQuery(creditPriceQuery())
  const credits = useQuery(creditsQuery())
  const skeleton = useDelayed(plans.isPending)
  const [enter] = useState(plans.isPending)
  const plansId = useId()
  const topUpsId = useId()

  const key = search.get(CHECKOUT)
  const next = safeNext(search.get(NEXT))
  const item = checkoutItem(key, plans.data ?? [])
  const paid = paidPlans(plans.data ?? [])

  const open = (checkout: string) => {
    setSearch(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.set(CHECKOUT, checkout)
        return params
      },
      { preventScrollReset: true, state: { checkout: true } }
    )
  }
  // back closes a checkout opened here; a link from elsewhere just drops the param
  const close = () => {
    if ((location.state as { checkout?: boolean } | null)?.checkout) {
      void navigate(-1)
      return
    }
    setSearch(
      (prev) => {
        const params = new URLSearchParams(prev)
        params.delete(CHECKOUT)
        return params
      },
      { replace: true, preventScrollReset: true }
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={t("title")}
        description={<span className="block max-w-prose">{t("lead")}</span>}
        actions={
          <>
            <p className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm">
              <Coins
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{t("balance")}</span>
              {credits.data ? (
                <span className="font-semibold tabular-nums">
                  <AnimatedNumber
                    value={credits.data.available_credits}
                    locale={locale}
                  />
                </span>
              ) : credits.isError ? (
                <span aria-hidden="true">—</span>
              ) : (
                <Skeleton className="h-4 w-6" />
              )}
            </p>
            <AppLink
              to={href("/employer/invoices")}
              className={buttonLink({ variant: "outline", size: "lg" })}
            >
              <FileText />
              {t("invoices")}
            </AppLink>
          </>
        }
      />

      {next && (
        <Alert>
          <Undo2 />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            {t("nextNote")}
            <AppLink
              to={next}
              className={buttonLink({
                variant: "outline",
                size: "sm",
                className: "no-underline",
              })}
            >
              {t("nextBack")}
            </AppLink>
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby={plansId} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={plansId} className="text-base font-semibold tracking-tight">
            {t("plans.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("plans.lead")}</p>
        </div>
        {plans.isError ? (
          <LoadError
            title={t("plans.errorTitle")}
            body={t("plans.errorBody")}
            onRetry={() => void plans.refetch()}
            retrying={plans.isFetching}
          />
        ) : plans.data ? (
          <div className="grid gap-4 md:grid-cols-2">
            {paid.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                topUpRate={price.data?.costPerCredit}
                enter={enter}
                index={i}
                onBuy={() => {
                  open(plan.slug)
                }}
              />
            ))}
          </div>
        ) : (
          skeleton && (
            <div
              role="status"
              aria-label={t("plans.loading")}
              className="grid gap-4 md:grid-cols-2"
            >
              <PlanSkeleton />
              <PlanSkeleton />
            </div>
          )
        )}
      </section>

      <section aria-labelledby={topUpsId} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={topUpsId} className="text-base font-semibold tracking-tight">
            {t("topUps.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("topUps.lead")}</p>
        </div>
        <TopUpPicker
          labelledBy={topUpsId}
          price={price}
          onBuy={(count) => {
            open(topUpKey(count))
          }}
        />
      </section>

      {item ? (
        <CheckoutDialog
          key={item.key}
          item={item}
          next={next}
          onClose={close}
        />
      ) : (
        key &&
        !plans.isPending && (
          <UnavailableDialog failed={plans.isError} onClose={close} />
        )
      )}
    </div>
  )
}
