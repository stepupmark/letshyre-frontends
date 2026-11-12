import { expect, it } from "vitest"

import {
  bonusClawback,
  commuteCost,
  ctcTakeHome,
  incomeTax,
  noticeBuyout,
  offerYearOne,
  salaryHike,
} from "./tools"

it("counts the notice in calendar days across a year end, and prices only the days not served", () => {
  const base = { resignedOn: "2026-10-16", noticeDays: 90, monthlyPay: 150_000 }
  expect(noticeBuyout(base)).toEqual({
    freeFrom: "2027-01-14",
    unserved: 0,
    buyout: 0,
  })
  expect(noticeBuyout({ ...base, joinOn: "2026-11-15" })).toEqual({
    freeFrom: "2027-01-14",
    unserved: 60,
    buyout: 300_000,
  })
  expect(noticeBuyout({ ...base, joinOn: "2027-02-01" }).unserved).toBe(0)
  expect(noticeBuyout({ ...base, joinOn: "2026-10-01" }).unserved).toBe(90)
})

it("taxes salary under the new regime with the rebate, marginal relief and cess", () => {
  expect(incomeTax(1_200_000)).toBe(0)
  expect(incomeTax(1_210_000)).toBe(10_400)
  expect(incomeTax(2_400_000)).toBe(312_000)
  expect(incomeTax(3_000_000)).toBe(499_200)
})

it("splits a 20 lakh CTC into monthly pay, variable after tax and the year's tax", () => {
  const pay = ctcTakeHome({
    ctc: 2_000_000,
    variableShare: 0.1,
    basicShare: 0.5,
  })
  expect(Math.round(pay.monthly)).toBe(119_657)
  expect(Math.round(pay.variable)).toBe(159_157)
  expect(pay.tax).toBe(163_372)
})

it("shows a 30% CTC hike as a smaller hike in the monthly payslip", () => {
  const hike = salaryHike({
    current: 2_000_000,
    offered: 2_600_000,
    variableShare: 0.1,
  })
  expect(hike.ctcHike).toBe(0.3)
  expect(hike.inHandHike).toBeCloseTo(0.2514, 4)
  expect(Math.round(hike.extraPerMonth)).toBe(30_087)
})

it("taxes a joining bonus at the year's top slab, so a bigger payslip can pay less in year one", () => {
  const variable = offerYearOne({
    ctc: 2_400_000,
    variableShare: 0.15,
    joiningBonus: 0,
  })
  const bonus = offerYearOne({
    ctc: 2_200_000,
    variableShare: 0,
    joiningBonus: 200_000,
  })
  expect(bonus.monthly).toBeGreaterThan(variable.monthly)
  // 45,574 of the bonus at 20% and the rest at 25%, plus cess: 49,630 of tax
  expect(Math.round(bonus.yearOne)).toBe(
    Math.round(bonus.monthly * 12 + 200_000 - 49_630)
  )
  expect(Math.round(variable.yearOne)).toBe(1_875_146)
  expect(Math.round(bonus.yearOne)).toBe(1_857_110)
})

it("repays a joining bonus in full or pro-rata, against the bonus after its tax", () => {
  // the bonus lands in the 25% slab, so 52,000 of it goes in tax
  expect(
    bonusClawback({ ctc: 2_400_000, bonus: 200_000, monthsStayed: 9 })
  ).toEqual({ inHand: 148_000, prorated: 50_000, full: 200_000 })
  expect(
    bonusClawback({ ctc: 2_400_000, bonus: 200_000, monthsStayed: 12 })
  ).toMatchObject({ prorated: 0, full: 0 })
  // under the 12 lakh rebate the bonus isn't taxed at all
  expect(
    bonusClawback({ ctc: 1_000_000, bonus: 200_000, monthsStayed: 3 }).inHand
  ).toBe(200_000)
})

it("turns a daily commute into hours, rupees and working days", () => {
  const five = commuteCost({
    daysPerWeek: 5,
    minutesPerTrip: 150,
    costPerTrip: 350,
  })
  expect(Math.round(five.hoursPerMonth)).toBe(54)
  expect(Math.round(five.costPerMonth)).toBe(7583)
  expect(Math.round(five.workdaysPerYear)).toBe(81)
  expect(
    commuteCost({ daysPerWeek: 2, minutesPerTrip: 150, costPerTrip: 350 })
      .hoursPerMonth / five.hoursPerMonth
  ).toBeCloseTo(0.4)
})
