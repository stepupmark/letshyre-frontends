import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { formatRupees } from "../../lib/money"
import type { Quote } from "../../schemas/billing.schema"

export function Breakdown({
  quote,
  coupon,
}: {
  quote: Quote | undefined
  coupon: string | null
}) {
  const { t } = useTranslation("billing")
  const locale = useLocale()
  if (!quote)
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4" aria-busy>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-6 w-1/3" />
      </div>
    )
  const money = (n: number) => formatRupees(locale, n)
  return (
    <dl className="flex flex-col gap-2 rounded-lg border p-4 text-sm tabular-nums">
      <Line
        label={t("checkout.credits", {
          count: quote.credits,
          rate: money(quote.rate),
        })}
        value={money(quote.subtotal)}
      />
      {quote.discount > 0 && (
        <Line
          label={
            coupon
              ? t("checkout.couponLine", { code: coupon })
              : t("checkout.discount")
          }
          value={`−${money(quote.discount)}`}
          tone="success"
        />
      )}
      <Line
        label={t("checkout.gst", { percent: quote.gstPercent })}
        value={money(quote.gst)}
      />
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t pt-3">
        <dt className="font-medium">{t("checkout.total")}</dt>
        <dd className="text-lg font-semibold">{money(quote.total)}</dd>
      </div>
    </dl>
  )
}

function Line({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "success"
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "success" ? "text-success" : undefined}>
        {value}
      </dd>
    </div>
  )
}
