import AxeBuilder from "@axe-core/playwright"

import { expect, test } from "./fixtures"

test("on a phone the menu is a labelled navigation that closes after a tap", async ({
  page,
  signInAs,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  await page.getByRole("button", { name: "Toggle sidebar" }).click()
  const nav = page.getByRole("navigation", { name: "Main navigation" })
  await nav.getByRole("link", { name: "Jobs", exact: true }).click()

  await expect(page).toHaveURL("/employer/jobs")
  await expect(nav).toBeHidden()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test("a collapsed sidebar stays collapsed after a reload", async ({
  page,
  signInAs,
}) => {
  await signInAs("candidate")
  await page.goto("/employee/jobs")
  const nav = page.getByRole("navigation", { name: "Main navigation" })
  await expect(nav.getByText("Find jobs")).toBeVisible()

  await page
    .getByRole("main")
    .getByRole("button", { name: "Toggle sidebar" })
    .click()
  await expect(nav.getByText("Find jobs")).toBeHidden()
  await page.reload()
  await expect(nav.getByRole("link", { name: "Find jobs" })).toBeVisible()
  await expect(nav.getByText("Find jobs")).toBeHidden()
})
