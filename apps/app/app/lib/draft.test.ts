// @vitest-environment jsdom
import { expect, test } from "vitest"

import { clearAllDrafts, clearDraft, loadDraft, saveDraft } from "./draft"

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

test("signing out clears every draft but leaves other storage alone", () => {
  saveDraft("post-job:a@test.in", { title: "Designer" })
  saveDraft("employer-onboarding", { company_name: "Acme" })
  localStorage.setItem("theme", "dark")

  clearAllDrafts()

  expect(loadDraft("post-job:a@test.in")).toBeNull()
  expect(loadDraft("employer-onboarding")).toBeNull()
  expect(localStorage.getItem("theme")).toBe("dark")
})
