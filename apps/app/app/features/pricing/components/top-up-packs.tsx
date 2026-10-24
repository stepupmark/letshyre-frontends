import { useTranslation } from "@workspace/i18n/react"
import { Card } from "@workspace/ui/components/card"
import { CoinsIcon } from "lucide-react"
import { useId } from "react"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"

import { useMoney } from "../hooks/use-money"
import { useCreditCost } from "../hooks/use-plans"
import { topUpHref } from "../lib/checkout-url"
import { priceForCredits, TOP_UPS } from "../lib/plans"
import { isPricePending } from "../lib/price-status"
import { Price } from "./price"
import { PriceNotice } from "./price-notice"
import { Section, SectionHeader } from "./section"

const LARGEST = Math.max(...TOP_UPS)

export function TopUpPacks() {
  const { t } = useTranslation("pricing")
  const titleId = useId()
  const money = useMoney()
  const { status, costPerCredit, retry, isRetrying } = useCreditCost()
  const pending = isPricePending(status)

  return (
    <Section aria-labelledby={titleId} className="border-t py-12 sm:py-16">
      <SectionHeader
        id={titleId}
        title={<span className="text-brand">{t("topUps.title")}</span>}
        description={`${t("topUps.body")} ${t("topUps.sameRate")}`}
      />
      <div className="mt-6 flex flex-col gap-4">
        <PriceNotice status={status} onRetry={retry} isRetrying={isRetrying} />
        <ul
          aria-busy={pending || undefined}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TOP_UPS.map((credits) => {
            const amount =
              costPerCredit === null
                ? null
                : priceForCredits(credits, costPerCredit)
            return (
              <li key={credits}>
                <Card className="h-full gap-4 p-5 transition-shadow hover:ring-brand/40">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <CoinsIcon aria-hidden className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-semibold tracking-tight">
                      {t("topUps.credits", { count: credits })}
                    </h3>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <Price
                        amount={amount}
                        pending={pending}
                        className="text-lg"
                      />
                      <span className="text-sm text-muted-foreground">
                        {t("topUps.priceNote")}
                      </span>
                    </div>
                  </div>
                  <div
                    aria-hidden
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(credits / LARGEST) * 100}%` }}
                    />
                  </div>
                  <AppLink
                    to={topUpHref(credits)}
                    aria-label={
                      amount === null
                        ? t("topUps.ctaLabelNoPrice", { count: credits })
                        : t("topUps.ctaLabel", {
                            count: credits,
                            price: money(amount),
                          })
                    }
                    className={buttonLink({
                      variant: "outline",
                      size: "lg",
                      className: "mt-auto h-10 w-full",
                    })}
                  >
                    {t("topUps.cta")}
                  </AppLink>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}
