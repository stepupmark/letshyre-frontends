import { expect, it } from "vitest"

import { parseIsoDate } from "./date"

it("accepts only days that exist on the calendar", () => {
  expect(parseIsoDate("2024-02-29")).toEqual(new Date(2024, 1, 29))
  expect(parseIsoDate("2023-02-29")).toBeNull()
  expect(parseIsoDate("1999-04-31")).toBeNull()
  expect(parseIsoDate("1999-4-1")).toBeNull()
  expect(parseIsoDate("1999--12")).toBeNull()
})
