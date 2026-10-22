import { toPaise } from "./checkout"

// paise always shown, unless `whole` and the amount is whole
export const formatRupees = (locale: string, value: number, whole = false) => {
  const digits = whole && Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat(`${locale}-IN`, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export const priceFor = (credits: number, rate: number) =>
  (toPaise(rate) * credits) / 100

// whole percent a plan's rate saves over buying credits one pack at a time
export const savingsVs = (rate: number, baseline: number) => {
  const base = toPaise(baseline)
  const paid = toPaise(rate)
  return base > 0 && paid < base ? Math.floor(((base - paid) * 100) / base) : 0
}
