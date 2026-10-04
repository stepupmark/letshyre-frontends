import type { Page } from "@playwright/test"

export const USERS = {
  employer: {
    role: "Employer",
    is_profile_completed: true,
    email: "employer@test.in",
  },
  employerNew: {
    role: "Employer",
    is_profile_completed: false,
    email: "new@test.in",
  },
  candidate: { role: "Candidate", email: "candidate@test.in" },
} as const

/** Seeds the same storage the login call writes, before any app code runs. */
export async function signInAs(page: Page, who: keyof typeof USERS) {
  await page.addInitScript((user) => {
    localStorage.setItem("accessToken", "e2e-access")
    localStorage.setItem("refreshToken", "e2e-refresh")
    localStorage.setItem("user", JSON.stringify(user))
  }, USERS[who])
}
