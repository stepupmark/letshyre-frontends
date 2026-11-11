import { expect, it } from "vitest"

import { publishSource } from "./frontmatter"

it("publishes by touching only draft and publishedAt, keeping comments and CRLF", () => {
  const draft = [
    "---",
    'title: "Notice: what to ask"',
    "publishedAt: 2026-11-01 # UTC",
    "draft: true",
    "tags: [salary]",
    "---",
    "",
    "draft: true stays in the body.",
    "",
  ].join("\r\n")

  expect(publishSource(draft, "2026-11-20")).toBe(
    [
      "---",
      'title: "Notice: what to ask"',
      "publishedAt: 2026-11-20 # UTC",
      "tags: [salary]",
      "---",
      "",
      "draft: true stays in the body.",
      "",
    ].join("\r\n")
  )
})
