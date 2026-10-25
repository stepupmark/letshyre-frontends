import { toPaise } from "./checkout"

// paise always shown, unless `whole` and the amount is whole
const rupees = (locale: string, value: number, whole: boolean) => {
  const digits = whole && Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat(`${locale}-IN`, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export const formatRupees = (locale: string, value: number, whole = false) =>
  rupees(locale, value, whole).format(value)

// the symbol split from the figure so it can be set smaller, wherever the locale puts it
export const rupeeParts = (locale: string, value: number, whole = false) =>
  rupees(locale, value, whole)
    .formatToParts(value)
    .reduce<{ symbol: boolean; text: string }[]>((parts, part) => {
      const symbol = part.type === "currency"
      const last = parts.at(-1)
      if (last && !last.symbol && !symbol) last.text += part.value
      else parts.push({ symbol, text: part.value })
      return parts
    }, [])

export const priceFor = (credits: number, rate: number) =>
  (toPaise(rate) * credits) / 100

// whole percent a plan's rate saves over buying credits one pack at a time
export const savingsVs = (rate: number, baseline: number) => {
  const base = toPaise(baseline)
  const paid = toPaise(rate)
  return base > 0 && paid < base ? Math.floor(((base - paid) * 100) / base) : 0
}
