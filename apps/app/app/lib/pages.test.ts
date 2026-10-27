import { expect, test } from "vitest"

import { pageWindow } from "./pages"

test("shows every page when there are few", () => {
  expect(pageWindow(1, 1)).toEqual([1])
  expect(pageWindow(2, 4)).toEqual([1, 2, 3, 4])
})

test("collapses the far pages into gaps", () => {
  expect(pageWindow(6, 12)).toEqual([1, null, 5, 6, 7, null, 12])
  expect(pageWindow(1, 12)).toEqual([1, 2, null, 12])
  expect(pageWindow(12, 12)).toEqual([1, null, 11, 12])
})

test("shows the page instead of a gap that would hide only one", () => {
  expect(pageWindow(4, 12)).toEqual([1, 2, 3, 4, 5, null, 12])
})
