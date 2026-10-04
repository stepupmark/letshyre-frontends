import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { signInAs } from "./session"

// fails the test on any console error, uncaught error or CSP violation
function watch(page: Page) {
  const problems: string[] = []
  page.on("pageerror", (e) => problems.push(e.message))
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(m.text())
  })
  void page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`CSP: ${e.violatedDirective} ${e.blockedURI}`)
    })
  })
  return problems
}

test("the dashboard route renders under the production CSP", async ({
  page,
}) => {
  const problems = watch(page)
  await signInAs(page, "employer")
  await page.goto("/employer/dashboard")

  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" })
  ).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow"
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  expect(problems).toEqual([])
})

test("an unknown path shows the not-found screen", async ({ page }) => {
  await page.goto("/employer/nothing-here")

  await expect(
    page.getByRole("heading", { name: "We couldn't find this page" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Go to your dashboard" })
  ).toHaveAttribute("href", "/employer/dashboard")
})

test("protected pages send visitors where they belong", async ({ page }) => {
  await page.goto("/employer/dashboard")
  await expect(page).toHaveURL("/")

  await signInAs(page, "employerNew")
  await page.goto("/employer/dashboard")
  await expect(page).toHaveURL("/employer/onboarding")
})
