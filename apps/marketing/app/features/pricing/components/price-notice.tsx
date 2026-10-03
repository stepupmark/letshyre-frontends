import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"

import type { PriceStatus } from "../lib/price-status"

export function PriceNotice({
  status,
  onRetry,
  isRetrying,
}: {
  status: PriceStatus
  onRetry: () => void
  isRetrying: boolean
}) {
  const { t } = useTranslation("pricing")

  // remount the message after each failed retry so screen readers announce it again
  const [attempt, setAttempt] = useState(0)
  const [wasRetrying, setWasRetrying] = useState(isRetrying)
  if (isRetrying !== wasRetrying) {
    setWasRetrying(isRetrying)
    if (!isRetrying) setAttempt((n) => n + 1)
  }

  if (status !== "error" && status !== "offline") return null

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div key={attempt} role="alert" className="flex flex-col gap-1">
        <p className="font-medium">{t(`prices.${status}.title`)}</p>
        <p className="text-sm text-muted-foreground">
          {t(`prices.${status}.body`)}
        </p>
      </div>
      <Button
        variant="outline"
        size="lg"
        aria-disabled={isRetrying || undefined}
        onClick={() => {
          if (!isRetrying) onRetry()
        }}
        className="shrink-0 aria-disabled:opacity-70"
      >
        {isRetrying ? t("prices.retrying") : t("prices.retry")}
      </Button>
    </div>
  )
}
