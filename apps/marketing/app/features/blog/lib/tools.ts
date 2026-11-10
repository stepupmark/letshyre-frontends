const DAY = 86_400_000

/** A number input's value, or 0 while it's empty or half-typed. */
export const numberOf = (value: string) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** What the extra days a role stays open cost, valuing each day at the salary it would earn. */
export function vacancyCost({
  salary,
  daysNow,
  daysTarget,
}: {
  salary: number
  daysNow: number
  daysTarget: number
}) {
  const perDay = salary / 365
  return { perDay, extra: Math.max(0, daysNow - daysTarget) * perDay }
}

/**
 * When a notice period ends, and the buyout to leave by a chosen date. Calendar days, and a month
 * of pay over 30 days, the usual way Indian employers count it; their own policy decides.
 */
export function noticeBuyout({
  resignedOn,
  noticeDays,
  monthlyPay,
  joinOn,
}: {
  resignedOn: string
  noticeDays: number
  monthlyPay: number
  joinOn?: string
}) {
  const free = Date.parse(`${resignedOn}T00:00:00Z`) + noticeDays * DAY
  const join = joinOn ? Date.parse(`${joinOn}T00:00:00Z`) : free
  const unserved = Math.max(0, Math.round((free - join) / DAY))
  return {
    freeFrom: new Date(free).toISOString().slice(0, 10),
    unserved,
    buyout: unserved * (monthlyPay / 30),
  }
}
