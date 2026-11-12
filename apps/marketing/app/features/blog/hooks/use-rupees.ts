import { useLocale } from "@workspace/i18n/react"

/** Whole rupees, grouped in lakhs and crores the way Indian pay is read. */
export function useRupees() {
  const lang = useLocale()
  const rupees = new Intl.NumberFormat(`${lang}-IN`, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
  return (value: number) => rupees.format(value)
}
