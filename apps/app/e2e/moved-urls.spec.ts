import { expect, test, type USERS } from "./fixtures"

// old bookmarks and email links still land on the right page
const MOVED: [keyof typeof USERS, string, string][] = [
  ["employer", "/employer", "/employer/dashboard"],
  ["employer", "/employer/view-jobs", "/employer/jobs"],
  ["employer", "/employer/view-jobs/101", "/employer/jobs/101"],
  ["employer", "/employer/view-jobs/101?edit=1", "/employer/jobs/101/edit"],
  [
    "employer",
    "/employer/view-jobs/applicants/101",
    "/employer/jobs/101/applicants",
  ],
  [
    "employer",
    "/employer/candidate-pool?jobId=101",
    "/employer/candidates?jobId=101",
  ],
  ["employer", "/employer/employee-profile?id=31", "/employer/candidates/31"],
  [
    "employer",
    "/employer/employee-score-card?id=31",
    "/employer/candidates/31/scorecard",
  ],
  ["employer", "/employer/employee-profile", "/employer/candidates/unlocked"],
  ["candidate", "/employee", "/employee/jobs"],
  ["candidate", "/employee/scorecard?id=9", "/employee/scorecards/9"],
]

for (const [who, from, to] of MOVED) {
  test(`${from} moved to ${to}`, async ({ page, signInAs }) => {
    test.skip(
      test.info().project.name !== "chromium",
      "routing is browser-independent"
    )
    await signInAs(who)
    await page.goto(from)
    await expect(page).toHaveURL(to)
  })
}

test("an unknown employer page shows not-found inside the app", async ({
  page,
  signInAs,
}) => {
  await signInAs("employer")
  await page.goto("/employer/nope")

  await expect(
    page.getByRole("heading", { name: "We couldn't find this page" })
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "12 credits" })).toBeVisible()
})
