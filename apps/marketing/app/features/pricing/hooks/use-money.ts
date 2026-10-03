import { useFormat } from "@workspace/i18n/react"
import { useCallback } from "react"

/** Rupees, with paise only when the amount has them. */
export function useMoney() {
  const format = useFormat()
  return useCallback(
    (value: number) => {
      const digits = Number.isInteger(value) ? 0 : 2
      return format.currency(value, "INR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    },
    [format]
  )
}
