import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { useQuery } from "@tanstack/react-query"
import { Undo2 } from "lucide-react"
import { useId, useState } from "react"

import { AppLink } from "@/components/app-link"
import { PageHeader } from "@/components/page-header"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { buttonLink } from "@/lib/button-link"
import { creditsQuery } from "@/lib/credits"
import { creditPriceQuery, plansQuery } from "@/lib/pricing"

import { useCheckoutParam } from "../../hooks/use-checkout-param"
import { checkoutItem, paidPlans, topUpKey } from "../../lib/checkout"
import { CheckoutDialog } from "../checkout/checkout-dialog"
import { BalancePanel } from "./balance-panel"
import { IncludedStrip } from "./included-strip"
import { PlanCard, PlanSkeleton } from "./plan-card"
import { SectionHeading } from "./section-heading"
import { TopUpPicker } from "./top-up-picker"
import { UnavailableDialog } from "./unavailable-dialog"

export function Billing() {
  const { t } = useTranslation("billing")
  const plans = useQuery(plansQuery())
  const price = useQuery(creditPriceQuery())
  const credits = useQuery(creditsQuery())
  const checkout = useCheckoutParam()
  const skeleton = useDelayed(plans.isPending)
  const [enter] = useState(plans.isPending)
  const plansId = useId()
  const topUpsId = useId()

  const item = checkoutItem(checkout.key, plans.data ?? [])
  const paid = paidPlans(plans.data ?? [])

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("title")}
          description={<span className="block max-w-prose">{t("intro")}</span>}
        />

        {checkout.next && (
          <Alert>
            <Undo2 />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              {t("nextNote")}
              <AppLink
                to={checkout.next}
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

        <BalancePanel />
      </div>

      <section aria-labelledby={plansId} className="flex flex-col gap-5">
        <SectionHeading
          id={plansId}
          title={t("plans.title")}
          lead={t("plans.lead")}
        />
        <IncludedStrip />
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
                  checkout.open(plan.slug)
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

      <section aria-labelledby={topUpsId} className="flex flex-col gap-5">
        <SectionHeading
          id={topUpsId}
          title={t("topUps.heading")}
          lead={t("topUps.body")}
        />
        <TopUpPicker
          labelledBy={topUpsId}
          price={price}
          balance={credits.data?.available_credits}
          onBuy={(count) => {
            checkout.open(topUpKey(count))
          }}
        />
      </section>

      {item ? (
        <CheckoutDialog
          key={item.key}
          item={item}
          next={checkout.next}
          onClose={checkout.close}
        />
      ) : (
        checkout.key &&
        !plans.isPending && (
          <UnavailableDialog failed={plans.isError} onClose={checkout.close} />
        )
      )}
    </div>
  )
}
