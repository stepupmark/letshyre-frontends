import { expect, test } from "vitest"

import { checkFile } from "./file-rules"

const rules = { accept: [".pdf", ".docx"], maxBytes: 5 * 1024 * 1024 }

test("accepts allowed types within the size limit, case-insensitively", () => {
  expect(checkFile({ name: "Resume.PDF", size: 1024 }, rules)).toBeNull()
})

test("rejects the wrong type, a disguised name and an oversized file", () => {
  expect(checkFile({ name: "photo.png", size: 10 }, rules)).toEqual({
    kind: "wrongType",
  })
  expect(checkFile({ name: "pdf", size: 10 }, rules)).toEqual({
    kind: "wrongType",
  })
  expect(checkFile({ name: "cv.pdf", size: 6 * 1024 * 1024 }, rules)).toEqual({
    kind: "tooLarge",
    size: 6 * 1024 * 1024,
    max: rules.maxBytes,
  })
})
