import { expect, test } from "vitest"

import { readTableParams, writeTableParams } from "../src/table-params"

const sortable = ["created_at", "score"]

test("reads only valid pages and sortable columns from the URL", () => {
  expect(
    readTableParams(new URLSearchParams("page=3&sort=-score&q= ana "), {
      sortable,
    })
  ).toEqual({
    page: 3,
    sort: { id: "score", desc: true },
    q: "ana",
  })
  expect(
    readTableParams(new URLSearchParams("page=-2&sort=password"), { sortable })
  ).toEqual({ page: 1, sort: null, q: "" })
})

test("a new sort, search or filter starts again at page 1", () => {
  const at3 = new URLSearchParams("page=3&status=new")

  expect(writeTableParams(at3, { page: 4 }).toString()).toBe(
    "page=4&status=new"
  )
  expect(
    writeTableParams(at3, { sort: { id: "score", desc: false } }).toString()
  ).toBe("status=new&sort=score")
  expect(writeTableParams(at3, { filters: { status: null } }).toString()).toBe(
    ""
  )
})
