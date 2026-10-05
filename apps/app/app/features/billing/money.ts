/** Rupees as on an invoice: paise always shown unless `whole` and the amount is whole. */
export const formatRupees = (locale: string, value: number, whole = false) => {
  const digits = whole && Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat(`${locale}-IN`, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}
