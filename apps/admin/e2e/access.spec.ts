import AxeBuilder from "@axe-core/playwright"

import { ADMIN, CREDIT, expect, reply, signedIn, test } from "./fixtures"

test("only admins get in, and land on the page they asked for", async ({
  page,
  api,
}) => {
  let revoked = 0
  await api({
    "POST /user/v1/login/": async (route) => {
      const { email } = route.request().postDataJSON() as { email: string }
      await reply(
        route,
        signedIn(
          email === ADMIN.email ? ADMIN : { ...ADMIN, email, role: "Employer" }
        )
      )
    },
    "POST /user/v1/logout/": async (route) => {
      revoked++
      await reply(route, { success: true })
    },
    "GET /finances/v1/credits_managment/": CREDIT,
  })

  await page.goto("/dashboard/credits")
  await expect(page).toHaveURL(
    `/sign-in?next=${encodeURIComponent("/dashboard/credits")}`
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.getByLabel("Email").fill("employer@acme.in")
  await page.getByLabel("Password", { exact: true }).fill("secret-123")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.getByRole("alert")).toContainText(
    "This account doesn't have admin access."
  )
  expect(
    await page.evaluate(() => localStorage.getItem("accessToken"))
  ).toBeNull()
  expect(revoked).toBe(1)

  await page.getByLabel("Email").fill(ADMIN.email)
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL("/dashboard/credits")
  await expect(
    page.getByRole("heading", { level: 1, name: "Credits" })
  ).toBeVisible()
})
