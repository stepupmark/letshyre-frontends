import { beforeEach, expect, it } from "vitest"

import { savedPosts } from "./reader"

const KEY = "lh-blog:saved:en"

beforeEach(() => {
  localStorage.clear()
})

it("drops the oldest save past 200 instead of losing them all", () => {
  const saved = savedPosts("en")
  for (let i = 0; i < 201; i++) saved.toggle(`post-${i}`)
  const list = saved.read()
  expect(list).toHaveLength(200)
  expect(list[0]).toBe("post-200")
  expect(list).not.toContain("post-0")
})

it("keeps the newest 200 of a list stored over the cap", () => {
  localStorage.setItem(
    KEY,
    JSON.stringify(Array.from({ length: 250 }, (_, i) => `post-${i}`))
  )
  const list = savedPosts("en").read()
  expect(list).toHaveLength(200)
  expect(list[0]).toBe("post-0")
})
