import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

import { useMoney } from "../hooks/use-money"

export function Price({
  amount,
  pending,
  className,
}: {
  amount: number | null
  pending: boolean
  className?: string
}) {
  const { t } = useTranslation("pricing")
  const money = useMoney()

  if (amount !== null) {
    return (
      <span
        className={cn("font-semibold tracking-tight tabular-nums", className)}
      >
        {money(amount)}
      </span>
    )
  }
  if (pending) {
    return (
      <Skeleton
        data-testid="price-skeleton"
        className={cn("my-[0.15lh] h-[0.7lh] w-28 rounded-sm", className)}
      />
    )
  }
  return (
    <span
      className={cn(
        "font-semibold tracking-tight text-muted-foreground",
        className
      )}
    >
      <span aria-hidden>—</span>
      <span className="sr-only">{t("plans.unavailable")}</span>
    </span>
  )
}
