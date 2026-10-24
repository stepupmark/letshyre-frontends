import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { CheckIcon } from "lucide-react"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

import { usePlanCopy } from "../hooks/use-plan-copy"
import { planHref } from "../lib/checkout-url"
import type { PricingPlan } from "../lib/plans"
import { Price } from "./price"

function PlanLink({ plan, label }: { plan: PricingPlan; label: string }) {
  const locale = useLocale()
  return (
    <AppLink
      to={planHref(plan, locale)}
      className={buttonLink({
        variant: plan.featured ? "default" : "outline",
        size: "lg",
        className: "h-10 w-full",
      })}
    >
      {label}
    </AppLink>
  )
}

export function PlanCard({
  plan,
  pending,
}: {
  plan: PricingPlan
  pending: boolean
}) {
  const { t } = useTranslation("pricing")
  const copy = usePlanCopy()
  const custom = plan.billing === "custom"

  const features = custom
    ? t("plans.custom.features", { returnObjects: true })
    : [
        plan.seats !== null && t("plans.seats", { count: plan.seats }),
        t("plans.noExpiry"),
        plan.topUps && t("plans.topUps"),
      ].filter((feature) => typeof feature === "string")

  return (
    <Card
      data-featured={plan.featured || undefined}
      className="row-span-4 grid grid-rows-subgrid gap-0 py-0 data-featured:ring-2 data-featured:ring-brand"
    >
      <CardHeader className="gap-1 px-6 pt-6">
        <CardTitle>
          <h3 className="text-lg font-semibold">{copy.name(plan)}</h3>
        </CardTitle>
        <CardDescription>{copy.audience(plan)}</CardDescription>
        {plan.featured && (
          <CardAction>
            <Badge>{copy.badge(plan)}</Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="px-6 pt-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {custom ? (
            <span className="text-4xl font-semibold tracking-tight">
              {t("plans.custom.price")}
            </span>
          ) : (
            <Price
              amount={plan.price}
              pending={pending}
              className={
                plan.featured && plan.price !== null
                  ? "text-4xl text-brand"
                  : "text-4xl"
              }
            />
          )}
          <span className="text-sm text-muted-foreground">
            {copy.priceNote(plan)}
          </span>
        </div>
        {plan.credits !== null && (
          <p className="mt-2 text-sm font-medium">
            {t("plans.credits", { count: plan.credits })}
          </p>
        )}
      </CardContent>

      <CardContent className="px-6 pt-5">
        <ul className="flex flex-col gap-2.5 border-t pt-5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <CheckIcon
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-brand"
              />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="items-end border-t-0 bg-transparent p-6">
        <PlanLink plan={plan} label={copy.cta(plan)} />
      </CardFooter>
    </Card>
  )
}
