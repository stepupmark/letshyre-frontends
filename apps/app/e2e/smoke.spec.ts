import AxeBuilder from "@axe-core/playwright"

import { expect, test, watch } from "./fixtures"

test("the employer shell renders under the production CSP", async ({
  page,
  signInAs,
}) => {
  const problems = watch(page)
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" })
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "12 credits" })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow"
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(problems).toEqual([])
})

test("an unknown path shows the not-found screen", async ({ page }) => {
  await page.goto("/nothing-here")

  await expect(
    page.getByRole("heading", { name: "We couldn't find this page" })
  ).toBeVisible()
})

test("protected pages send visitors where they belong", async ({
  page,
  signInAs,
}) => {
  await page.goto("/employer/dashboard?tab=x")
  await expect(page).toHaveURL(
    `/employer/sign-in?next=${encodeURIComponent("/employer/dashboard?tab=x")}`
  )

  await signInAs("candidate")
  await page.goto("/employer/dashboard")
  await expect(page).toHaveURL("/employee/jobs")
})

test("sign out ends the session on the server and here", async ({
  page,
  api,
  signInAs,
}) => {
  let revoked: unknown
  await api({
    "POST /user/v1/logout/": async (route) => {
      revoked = route.request().postDataJSON()
      await route.fulfill({ json: { success: true } })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  if (test.info().project.name === "mobile") {
    await page.getByRole("button", { name: "Toggle sidebar" }).click()
  }
  await page.getByRole("button", { name: "Account menu" }).click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()

  await expect(page).toHaveURL("/")
  expect(revoked).toEqual({ refresh_token: "e2e-refresh" })
  expect(await page.evaluate(() => localStorage.getItem("user"))).toBeNull()
})
