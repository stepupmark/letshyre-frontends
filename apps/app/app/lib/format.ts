/** "Asha Menon" → "AM"; also splits on "@" for names that are still emails. */
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

/** 0.33 → "33%", or "+33%" when signed. */
export const formatPercent = (value: number, locale: string, signed = false) =>
  new Intl.NumberFormat(locale, {
    style: "percent",
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value)
