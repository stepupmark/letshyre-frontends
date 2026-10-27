import { expect, test, type USERS } from "./fixtures"

const HOME: Record<keyof typeof USERS, { visit: string; lands: string }> = {
  employer: { visit: "/employer/dashboard", lands: "/employer/dashboard" },
  employerNew: { visit: "/employer/dashboard", lands: "/employer/onboarding" },
  candidate: { visit: "/employee/jobs", lands: "/employee/jobs" },
}

for (const [who, { visit, lands }] of Object.entries(HOME)) {
  test(`${who} lands on their home`, async ({ page, signInAs }) => {
    test.skip(
      test.info().project.name !== "chromium",
      "routing is browser-independent"
    )
    await signInAs(who as keyof typeof USERS)
    await page.goto(visit)
    await expect(page).toHaveURL(lands)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
}
