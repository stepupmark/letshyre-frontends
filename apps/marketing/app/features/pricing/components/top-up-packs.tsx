import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"

import { useMoney } from "../hooks/use-money"
import { useCreditCost } from "../hooks/use-plans"
import { topUpHref } from "../lib/checkout-url"
import { priceForCredits, TOP_UPS } from "../lib/plans"
import { isPricePending } from "../lib/price-status"
import { Price } from "./price"
import { PriceNotice } from "./price-notice"

export function TopUpPacks() {
  const { t } = useTranslation("pricing")
  const titleId = useId()
  const money = useMoney()
  const { status, costPerCredit, retry, isRetrying } = useCreditCost()
  const pending = isPricePending(status)

  return (
    <Section aria-labelledby={titleId} className="pb-0 sm:pb-0">
      <SectionHeader
        id={titleId}
        title={t("topUps.title")}
        description={t("topUps.body")}
      />
      <div className="mt-8 flex flex-col gap-4">
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
                <Card className="h-full gap-0 py-0">
                  <CardHeader className="px-5 pt-5">
                    <CardTitle>
                      <h3 className="text-base font-semibold">
                        {t("topUps.credits", { count: credits })}
                      </h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pt-3">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <Price
                        amount={amount}
                        pending={pending}
                        className="text-2xl"
                      />
                      <span className="text-sm text-muted-foreground">
                        {t("topUps.priceNote")}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto border-t-0 bg-transparent p-5">
                    <a
                      href={topUpHref(credits)}
                      aria-label={
                        amount === null
                          ? t("topUps.ctaLabelNoPrice", { count: credits })
                          : t("topUps.ctaLabel", {
                              count: credits,
                              price: money(amount),
                            })
                      }
                      className={cn(
                        buttonVariants({
                          variant: "outline",
                          size: "lg",
                          className: "h-10 w-full",
                        })
                      )}
                    >
                      {t("topUps.cta")}
                    </a>
                  </CardFooter>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}
