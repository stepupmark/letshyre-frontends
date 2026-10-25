import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { UseQueryResult } from "@tanstack/react-query"
import { RotateCw } from "lucide-react"
import * as m from "motion/react-m"
import { useId, useState } from "react"

import { duration, ease } from "@/lib/motion"

import { TOP_UPS } from "../../lib/checkout"
import { formatRupees, priceFor } from "../../lib/money"
import { TopUpSummary } from "./top-up-summary"

export function TopUpPicker({
  labelledBy,
  price,
  balance,
  onBuy,
}: {
  labelledBy: string
  price: UseQueryResult<{ costPerCredit: number }>
  balance: number | undefined
  onBuy: (credits: number) => void
}) {
  const { t } = useTranslation(["billing", "common"])
  const locale = useLocale()
  const [credits, setCredits] = useState<number>(TOP_UPS[1])
  const selection = useId()
  const rate = price.data?.costPerCredit
  const amountOf = (count: number) =>
    rate === undefined
      ? null
      : formatRupees(locale, priceFor(count, rate), true)

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        aria-labelledby={labelledBy}
        value={credits}
        onValueChange={(value) => {
          setCredits(Number(value))
        }}
        className="grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {TOP_UPS.map((count) => {
          const amount = amountOf(count)
          return (
            <label
              key={count}
              className="group relative flex cursor-pointer flex-col gap-0.5 rounded-lg border p-4 transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-transparent motion-reduce:transition-none"
            >
              {count === credits && (
                <m.span
                  layoutId={selection}
                  aria-hidden="true"
                  transition={{ duration: duration.base, ease }}
                  className="pointer-events-none absolute -inset-px rounded-lg border-2 border-brand"
                />
              )}
              <RadioGroupItem value={count} className="sr-only" />
              <span className="text-lg font-semibold tabular-nums group-has-data-checked:text-brand-text">
                {t("topUps.credits", { count })}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {amount ?? <Skeleton className="mt-1 h-3.5 w-16" />}
              </span>
            </label>
          )
        })}
      </RadioGroup>

      {price.isError ? (
        <p
          role="alert"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground"
        >
          {t("topUps.priceError")}
          <Button
            variant="outline"
            size="sm"
            disabled={price.isFetching}
            onClick={() => void price.refetch()}
          >
            <RotateCw
              className={
                price.isFetching
                  ? "animate-spin motion-reduce:animate-none"
                  : undefined
              }
            />
            {t("common:state.retry")}
          </Button>
        </p>
      ) : (
        <TopUpSummary
          credits={credits}
          price={amountOf(credits)}
          balance={balance}
          onBuy={() => {
            onBuy(credits)
          }}
        />
      )}
    </div>
  )
}
