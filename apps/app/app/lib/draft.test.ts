// @vitest-environment jsdom
import { expect, test } from "vitest"

import { clearDraft, loadDraft, saveDraft } from "./draft"

test("a draft round-trips without the files in it", () => {
  const resume = new File(["pdf"], "cv.pdf")
  saveDraft("onboarding", {
    name: "Ana",
    resume,
    documents: [{ label: "PAN", file: resume }],
  })

  expect(loadDraft("onboarding")).toEqual({
    name: "Ana",
    documents: [{ label: "PAN" }],
  })

  clearDraft("onboarding")
  expect(loadDraft("onboarding")).toBeNull()
})
