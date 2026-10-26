import { expect, it } from "vitest"

import { compactParams, oneOf, pageOf } from "./search-params"

it("accepts only a known option from a hand-edited URL", () => {
  const statuses = ["pending", "approved"] as const
  expect(oneOf("approved", statuses)).toBe("approved")
  expect(oneOf("drop table", statuses)).toBeNull()
  expect(oneOf(null, statuses)).toBeNull()
})

it("reads a positive page number, defaulting to 1", () => {
  expect(pageOf(new URLSearchParams("page=3"))).toBe(3)
  for (const junk of ["page=0", "page=-2", "page=abc", ""])
    expect(pageOf(new URLSearchParams(junk))).toBe(1)
})

it("drops empty values but keeps zero and false", () => {
  expect(
    compactParams({ search: "", status: null, page: 0, paid: false, q: "x" })
  ).toEqual({ page: 0, paid: false, q: "x" })
})
