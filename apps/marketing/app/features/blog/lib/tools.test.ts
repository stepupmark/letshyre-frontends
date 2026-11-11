import { expect, it } from "vitest"

import { ctcTakeHome, incomeTax, noticeBuyout } from "./tools"

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
