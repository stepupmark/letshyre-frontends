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
  const unserved = Math.min(
    noticeDays,
    Math.max(0, Math.round((free - join) / DAY))
  )
  return {
    freeFrom: new Date(free).toISOString().slice(0, 10),
    unserved,
    buyout: unserved * (monthlyPay / 30),
  }
}

// new tax regime, 2025-26: [upper limit, rate]
const SLABS: readonly [number, number][] = [
  [400_000, 0],
  [800_000, 0.05],
  [1_200_000, 0.1],
  [1_600_000, 0.15],
  [2_000_000, 0.2],
  [2_400_000, 0.25],
  [Infinity, 0.3],
]
const REBATE_LIMIT = 1_200_000
const STANDARD_DEDUCTION = 75_000
const CESS = 0.04
// professional tax, ₹200 a month in most states that levy it
const PROFESSIONAL_TAX = 2_400
// employer PF on basic, and gratuity at 15 days' basic per year (15/26/12)
const EMPLOYER_PF = 0.12
const GRATUITY = 0.0481

/** Income tax with cess on taxable salary under the new regime; no surcharge, so under ₹50 lakh. */
export function incomeTax(taxable: number) {
  let tax = 0
  let lower = 0
  for (const [upper, rate] of SLABS) {
    tax += Math.max(0, Math.min(taxable, upper) - lower) * rate
    lower = upper
  }
  // the rebate clears tax up to the limit, and marginal relief caps it at the income above it
  if (taxable <= REBATE_LIMIT) tax = 0
  else tax = Math.min(tax, taxable - REBATE_LIMIT)
  return Math.round(tax * (1 + CESS))
}

/**
 * What a CTC pays out: the fixed part monthly, the variable part after its own tax. Employer PF
 * and gratuity sit inside the CTC but never reach the payslip.
 */
export function ctcTakeHome({
  ctc,
  variableShare,
  basicShare,
}: {
  ctc: number
  variableShare: number
  basicShare: number
}) {
  const variable = ctc * Math.min(1, variableShare)
  const basic = Math.min(1, basicShare)
  const gross = (ctc - variable) / (1 + basic * (EMPLOYER_PF + GRATUITY))
  const employeePf = gross * basic * EMPLOYER_PF
  const fixedTax = incomeTax(Math.max(0, gross - STANDARD_DEDUCTION))
  const tax = incomeTax(Math.max(0, gross + variable - STANDARD_DEDUCTION))
  return {
    monthly: (gross - employeePf - PROFESSIONAL_TAX - fixedTax) / 12,
    variable: variable - (tax - fixedTax),
    tax,
  }
}
