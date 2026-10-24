import AxeBuilder from "@axe-core/playwright"

import { expect, reply, test } from "./fixtures"

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
  test.skip(
    test.info().project.name === "mobile",
    "phones open the sidebar as a sheet"
  )
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

test("the sidebar marks the current page and the palette finds pages by meaning", async ({
  page,
  signInAs,
}) => {
  test.skip(
    test.info().project.name === "mobile",
    "phones open the sidebar as a sheet"
  )
  await signInAs("employer")
  await page.goto("/employer/dashboard")
  const nav = page.getByRole("navigation", { name: "Main navigation" })

  await expect(nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
    "aria-current",
    "page"
  )
  await nav.getByRole("link", { name: "Company profile" }).click()
  await expect(page).toHaveURL("/employer/company")
  await page.getByRole("link", { name: "Edit company" }).click()
  await expect(
    nav.getByRole("link", { name: "Company profile" })
  ).toHaveAttribute("aria-current", "page")
  await page
    .getByRole("link", { name: "Back to Company profile", exact: true })
    .click()
  await expect(page).toHaveURL("/employer/company")

  await page.keyboard.press("Control+k")
  const palette = page.getByRole("dialog", { name: "Search" })
  await palette.getByRole("combobox").fill("invoices")
  await expect(palette.getByRole("option", { name: "Billing" })).toBeVisible()
  await palette.getByRole("combobox").fill("shortcuts")
  await palette.getByRole("option", { name: "Keyboard shortcuts" }).click()
  await expect(
    page.getByRole("dialog", { name: "Keyboard shortcuts" })
  ).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test("the credit pill warns when the balance runs low", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "GET /payment/v1/employer_credits/": (route) =>
      reply(route, { data: { available_credits: 1 } }),
  })
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  await expect(
    page.getByRole("link", { name: "Running low: 1 credit" })
  ).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})
