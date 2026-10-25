import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ArrowRight } from "lucide-react"

import { AnimatedNumber } from "@/components/animated-number"

import { RollingText } from "../rolling-text"

export function TopUpSummary({
  credits,
  price,
  balance,
  onBuy,
}: {
  credits: number
  price: string | null
  balance: number | undefined
  onBuy: () => void
}) {
  const { t } = useTranslation("billing")
  const locale = useLocale()

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <dl className="flex flex-wrap gap-x-10 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-sm text-muted-foreground">
            {t("topUps.youPay")}
          </dt>
          <dd className="text-lg font-semibold">
            {price ? (
              <RollingText text={t("plusGst", { price })} />
            ) : (
              <Skeleton className="my-1 h-5 w-28" />
            )}
          </dd>
        </div>
        {balance !== undefined && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-sm text-muted-foreground">
              {t("topUps.after")}
            </dt>
            <dd className="flex items-center gap-2 text-lg font-semibold tabular-nums">
              <span className="text-muted-foreground">
                {new Intl.NumberFormat(locale).format(balance)}
              </span>
              <ArrowRight
                className="size-4 text-muted-foreground rtl:-scale-x-100"
                aria-hidden
              />
              <span className="text-brand-text">
                <AnimatedNumber value={balance + credits} locale={locale} />
              </span>
            </dd>
          </div>
        )}
      </dl>
      <Button
        size="lg"
        className="max-sm:w-full"
        disabled={price === null}
        onClick={onBuy}
      >
        {t("topUps.buyLabel", { count: credits })}
      </Button>
    </div>
  )
}
