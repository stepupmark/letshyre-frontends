import { expect, it, vi } from "vitest"

import { EXPORT_PAGE_LIMIT, fetchAllPages } from "./fetch-all-pages"

it("collects every page in order", async () => {
  const fetchPage = vi.fn((page: number) =>
    Promise.resolve({ results: [page * 10, page * 10 + 1], total_pages: 3 })
  )
  await expect(fetchAllPages(fetchPage)).resolves.toEqual({
    rows: [10, 11, 20, 21, 30, 31],
    truncated: false,
  })
  expect(fetchPage).toHaveBeenCalledTimes(3)
})

it("stops at the export limit and says the export is truncated", async () => {
  const fetchPage = vi.fn((page: number) =>
    Promise.resolve({ results: [page], total_pages: EXPORT_PAGE_LIMIT + 5 })
  )
  const { rows, truncated } = await fetchAllPages(fetchPage)
  expect(rows).toHaveLength(EXPORT_PAGE_LIMIT)
  expect(truncated).toBe(true)
  expect(fetchPage).toHaveBeenCalledTimes(EXPORT_PAGE_LIMIT)
})
