import { expect, test, type USERS } from "./fixtures"

const HOME: Record<keyof typeof USERS, { visit: string; lands: string }> = {
  employer: { visit: "/employer", lands: "/employer" },
  employerNew: { visit: "/employer", lands: "/employer/onboarding" },
  candidate: { visit: "/employee", lands: "/employee" },
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
  })
}
