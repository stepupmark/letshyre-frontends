import { expect, test } from "./fixtures"

test("each role's bare prefix opens its home page", async ({
  page,
  signInAs,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "routing is browser-independent"
  )
  await signInAs("employer")
  await page.goto("/employer")
  await expect(page).toHaveURL("/employer/dashboard")
})

test("an old dashboard URL is a 404, not a redirect", async ({
  page,
  signInAs,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "routing is browser-independent"
  )
  await signInAs("employer")
  await page.goto("/employer/view-jobs")
  await expect(page).toHaveURL("/employer/view-jobs")
  await expect(page.getByText("We couldn't find this page")).toBeVisible()
})
