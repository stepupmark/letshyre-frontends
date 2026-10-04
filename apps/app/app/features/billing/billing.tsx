import type { Plan } from "@workspace/api/public"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Check, Coins, Undo2 } from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { buttonLink } from "@/lib/button-link"
import { creditsQuery } from "@/lib/credits"

import { creditPriceQuery, plansQuery } from "./api"
import {
  CHECKOUT,
  checkoutItem,
  NEXT,
  paidPlans,
  safeNext,
  TOP_UPS,
  topUpKey,
} from "./checkout"
import { CheckoutDialog } from "./checkout-dialog"
import { formatRupees } from "./money"

// seats aren't in the plans API yet
const SEATS: Record<string, number> = { pro: 5, business: 25 }

// paise maths, so a rate like 2.35 can't drift
const priceFor = (credits: number, rate: number) =>
  (Math.round(rate * 100) * credits) / 100

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight text-balance outline-none"
          >
            {t("title")}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            {t("lead")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {credits.data && (
            <p className="flex items-center gap-2 text-sm">
              <Coins className="size-4 text-muted-foreground" aria-hidden />
              {t("balance")}
              <span className="text-base font-semibold tabular-nums">
                <AnimatedNumber
                  value={credits.data.available_credits}
                  locale={locale}
                />
              </span>
            </p>
          )}
          <AppLink
            to="/employer/invoice"
            className={buttonLink({ variant: "outline" })}
          >
            {t("invoices")}
          </AppLink>
        </div>
      </div>

      {next && (
        <Alert>
          <Undo2 />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            {t("nextNote")}
            <AppLink
              to={next}
              className={cn(
                buttonLink({ variant: "outline", size: "sm" }),
                "no-underline"
              )}
            >
              {t("nextBack")}
            </AppLink>
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="plans-title" className="flex flex-col gap-4">
        <div>
          <h2 id="plans-title" className="text-base font-medium">
            {t("plans.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("plans.lead")}
          </p>
        </div>
        {plans.isError ? (
          <LoadError
            onRetry={() => void plans.refetch()}
            retrying={plans.isRefetching}
          />
        ) : plans.data ? (
          <div className="grid gap-4 md:grid-cols-2">
            {paid.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onBuy={() => {
                  open(plan.slug)
                }}
              />
            ))}
          </div>
        ) : (
          skeleton && (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          )
        )}
      </section>

      <section aria-labelledby="topups-title" className="flex flex-col gap-4">
        <div>
          <h2 id="topups-title" className="text-base font-medium">
            {t("topUps.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("topUps.lead")}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TOP_UPS.map((count) => {
            const rate = price.data?.costPerCredit
            const amount = rate ? priceFor(count, rate) : null
            return (
              <li
                key={count}
                className="flex flex-col gap-3 rounded-lg border p-4"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-semibold tabular-nums">
                    {t("topUps.credits", { count })}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {amount === null
                      ? "—"
                      : t("plusGst", {
                          price: formatRupees(locale, amount, true),
                        })}
                  </span>
                </div>
                <Button
                  variant="outline"
                  aria-label={t("topUps.buyLabel", { count })}
                  onClick={() => {
                    open(topUpKey(count))
                  }}
                >
                  {t("topUps.buy")}
                </Button>
              </li>
            )
          })}
        </ul>
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
          <Unavailable failed={plans.isError} onClose={close} />
        )
      )}
    </div>
  )
}

function PlanCard({ plan, onBuy }: { plan: Plan; onBuy: () => void }) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  const seats = SEATS[plan.slug]
  const features = [
    t("plans.credits", { count: plan.credits }),
    plan.rate
      ? t("plans.rate", { rate: formatRupees(locale, plan.rate, true) })
      : null,
    seats ? t("plans.seats", { count: seats }) : null,
    t("plans.unlocks"),
    t("plans.noExpiry"),
    t("plans.topUps"),
  ].filter((feature): feature is string => Boolean(feature))

  return (
    <article
      className={cn(
        "flex flex-col gap-5 rounded-xl border p-6",
        plan.highlight && "border-primary ring-1 ring-primary"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          {plan.tagline && (
            <p className="text-sm text-muted-foreground">{plan.tagline}</p>
          )}
        </div>
        {plan.highlight && <Badge>{t("plans.popular")}</Badge>}
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatRupees(locale, plan.basePrice, true)}
        </span>
        <span className="text-sm text-muted-foreground">{t("plans.once")}</span>
      </p>
      <ul className="flex flex-1 flex-col gap-2 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant={plan.highlight ? "default" : "outline"}
        size="lg"
        onClick={onBuy}
      >
        {t("plans.buy", { name: plan.name })}
      </Button>
    </article>
  )
}

function Unavailable({
  failed,
  onClose,
}: {
  failed: boolean
  onClose: () => void
}) {
  const { t } = useTranslation("billing")
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {failed ? t("unavailable.failedTitle") : t("unavailable.title")}
          </DialogTitle>
          <DialogDescription>
            {failed ? t("unavailable.failedBody") : t("unavailable.body")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>{t("unavailable.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
