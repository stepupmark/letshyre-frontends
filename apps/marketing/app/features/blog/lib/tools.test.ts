import { expect, it } from "vitest"

import { noticeBuyout } from "./tools"

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
})
