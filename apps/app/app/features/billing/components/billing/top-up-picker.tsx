import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { UseQueryResult } from "@tanstack/react-query"
import { RotateCw } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useState } from "react"

import { duration, ease } from "@/lib/motion"

import { TOP_UPS } from "../../lib/checkout"
import { formatRupees, priceFor } from "../../lib/money"

export function TopUpPicker({
  labelledBy,
  price,
  onBuy,
}: {
  labelledBy: string
  price: UseQueryResult<{ costPerCredit: number }>
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
  const chosen = amountOf(credits)

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        aria-labelledby={labelledBy}
        value={credits}
        onValueChange={(value) => {
          setCredits(Number(value))
        }}
        className="grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {TOP_UPS.map((count) => {
          const amount = amountOf(count)
          return (
            <label
              key={count}
              className="relative flex cursor-pointer items-start justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-transparent"
            >
              {count === credits && (
                <m.span
                  layoutId={selection}
                  aria-hidden="true"
                  transition={{ duration: duration.base, ease }}
                  className="pointer-events-none absolute -inset-px rounded-lg border-2 border-brand"
                />
              )}
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-semibold tabular-nums">
                  {t("topUps.credits", { count })}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {amount ?? <Skeleton className="mt-1 h-3.5 w-16" />}
                </span>
              </span>
              <RadioGroupItem value={count} className="mt-1" />
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
        <Button
          size="lg"
          className="self-start max-sm:w-full"
          disabled={chosen === null}
          onClick={() => {
            onBuy(credits)
          }}
        >
          {t("topUps.buyLabel", { count: credits })}
          {chosen && (
            <span className="relative inline-grid overflow-hidden font-normal">
              <AnimatePresence initial={false} mode="popLayout">
                <m.span
                  key={chosen}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: duration.fast, ease }}
                  className="tabular-nums"
                >
                  {t("plusGst", { price: chosen })}
                </m.span>
              </AnimatePresence>
            </span>
          )}
        </Button>
      )}
    </div>
  )
}
