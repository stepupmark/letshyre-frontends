/** "1998-08-15" → a local Date, or null unless it's a real yyyy-mm-dd day. */
export function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(y, m - 1, d)
  return date.getMonth() === m - 1 && date.getDate() === d ? date : null
}

export const toIsoDate = (date: Date) =>
  [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")

export const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, date.getDate())

/** Whole years from `born` to `on`, counting the birthday itself. */
export function yearsBetween(born: Date, on: Date) {
  const beforeBirthday =
    on.getMonth() < born.getMonth() ||
    (on.getMonth() === born.getMonth() && on.getDate() < born.getDate())
  return on.getFullYear() - born.getFullYear() - (beforeBirthday ? 1 : 0)
}

/** "in 23 days", "tomorrow", "3 months ago". */
export function relativeDay(
  date: Date,
  locale: string,
  today = startOfToday()
) {
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  if (Math.abs(days) < 45) return format.format(days, "day")
  const months =
    (date.getFullYear() - today.getFullYear()) * 12 +
    date.getMonth() -
    today.getMonth()
  return Math.abs(months) < 24
    ? format.format(months, "month")
    : format.format(Math.trunc(months / 12), "year")
}
