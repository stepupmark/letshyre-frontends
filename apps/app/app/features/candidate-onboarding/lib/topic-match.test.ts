import { expect, test } from "vitest"

import { topicMatcher } from "./topic-match"

test("matches skills to interview topics by whole words", () => {
  const onResume = topicMatcher(["Go", "C", "Flutter", "REST APIs"])

  expect(onResume("Flutter framework")).toBe(true)
  expect(onResume("C programming")).toBe(true)
  expect(onResume("Google Cloud")).toBe(false)
  expect(onResume("Algorithms")).toBe(false)
})
