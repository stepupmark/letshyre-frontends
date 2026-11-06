// @vitest-environment jsdom
import { beforeEach, expect, test } from "vitest"

import { claimAccountData } from "./account-data"
import { loadDraft, saveDraft } from "./draft"

const signInAs = (id: number) => {
  localStorage.setItem("user", JSON.stringify({ role: "Employer", id }))
}

beforeEach(() => {
  localStorage.clear()
})

test("another account never sees the drafts the last one left", () => {
  signInAs(1)
  claimAccountData()
  saveDraft("employer-onboarding", { pan: "ABCDE1234F" })

  claimAccountData()
  expect(loadDraft("employer-onboarding")).toEqual({ pan: "ABCDE1234F" })

  signInAs(2)
  claimAccountData()
  expect(loadDraft("employer-onboarding")).toBeNull()
})
