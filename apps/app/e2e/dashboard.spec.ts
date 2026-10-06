import AxeBuilder from "@axe-core/playwright"

import { expect, reply, test } from "./fixtures"

test("a settled employer sees what needs them, their numbers and credits", async ({
  page,
  signInAs,
}) => {
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  await expect(page.getByText("You're all caught up.")).toBeVisible()
  await expect(
    page.getByRole("link", { name: /48\s*Applications received/ })
  ).toBeVisible()
  await expect(page.getByText("40% of your credits used")).toBeVisible()
  await expect(page.getByText("Finish setting up")).toBeHidden()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test("a new employer gets a setup checklist they can hide", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "GET /user/v1/employer_dashboard_cards/": (route) =>
      reply(route, {
        data: { active_jobs: 0, in_active_jobs: 0, total_applications: 0 },
      }),
    "GET /user/v1/employer_team_members/": (route) =>
      reply(route, { data: { count: 0 } }),
    "GET /payment/v1/employer_credits/": (route) =>
      reply(route, { data: { available_credits: 2 } }),
  })
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  await expect(page.getByText("2 of 4 done")).toBeVisible()
  await expect(page.getByText("Credits are running low")).toBeVisible()
  const attention = page.getByRole("region", { name: "Needs your attention" })
  await expect(
    attention.getByRole("link", { name: "Post a job" })
  ).toHaveAttribute("href", "/employer/jobs/new")

  await page.getByRole("button", { name: "Hide" }).click()
  await expect(page.getByText("Finish setting up")).toBeHidden()
  await page.reload()
  await expect(page.getByText("Credits are running low")).toBeVisible()
  await expect(page.getByText("Finish setting up")).toBeHidden()
})

test("tips show once each and can be brought back", async ({
  page,
  signInAs,
}) => {
  test.skip(
    test.info().project.name === "mobile",
    "the account menu sits in the collapsed sidebar"
  )
  await signInAs("employer", { tips: true })
  await page.goto("/employer/dashboard")

  const tip = page.getByRole("dialog", { name: "Jump anywhere" })
  await expect(tip).toBeVisible()
  await tip.getByRole("button", { name: "Got it" }).click()
  await page
    .getByRole("dialog", { name: "Your credit balance" })
    .getByRole("button", { name: "Got it" })
    .click()

  await page.reload()
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  await page.waitForTimeout(1000)
  await expect(page.getByRole("dialog")).toHaveCount(0)

  await page.getByRole("button", { name: "Account menu" }).click()
  await page.getByRole("menuitem", { name: "Show tips again" }).click()
  await expect(
    page.getByRole("dialog", { name: "Jump anywhere" })
  ).toBeVisible()
})
