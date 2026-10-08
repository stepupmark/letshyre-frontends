import AxeBuilder from "@axe-core/playwright"

import { CREDIT, expect, test, watch } from "./fixtures"

test("the shell renders under the production CSP, in both themes, and stays out of search", async ({
  page,
  api,
  signIn,
}) => {
  const problems = watch(page)
  await api({ "GET /finances/v1/credits_managment/": CREDIT })
  await signIn()
  await page.goto("/dashboard/credits")

  await expect(
    page.getByRole("heading", { level: 1, name: "Credits" })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow"
  )
  expect(await (await page.request.get("/robots.txt")).text()).toContain(
    "Disallow: /"
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.emulateMedia({ colorScheme: "dark" })
  await expect(page.locator("html")).toHaveClass(/dark/)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(problems).toEqual([])
})
