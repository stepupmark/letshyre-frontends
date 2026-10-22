import { axe, expect, fixture, reply, test } from "./fixtures"

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
  await expect(
    page.getByRole("progressbar", { name: "40% of your credits used" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: /3\s*Open jobs/ })
  ).toHaveAttribute("href", "/employer/jobs?status=open")
  await expect(
    page.getByRole("region", { name: "Recent jobs" }).getByRole("link")
  ).toHaveCount(4)
  await expect(page.getByText("Finish setting up")).toBeHidden()
  await axe(page)
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

test("the checklist shows a company still under review, not done", async ({
  page,
  api,
  signInAs,
}) => {
  const profile = fixture("user.v1.employer_profile.json")
  const data = profile.data as { kyc: object }
  await api({
    "GET /user/v1/employer_profile/": {
      ...profile,
      data: { ...data, kyc: { ...data.kyc, kyc_status: "Pending" } },
    },
    "GET /user/v1/employer_team_members/": (route) =>
      reply(route, { data: { count: 0 } }),
  })
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  await expect(page.getByText("2 of 4 done")).toBeVisible()
  await expect(
    page.getByText("Under review. We'll email you when it's checked.")
  ).toBeVisible()
  await axe(page)
})

test("a balance that fails to load keeps Add credits working", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "GET /payment/v1/employer_credits/": (route) =>
      reply(route, { success: false }, 500),
  })
  await signInAs("employer")
  await page.goto("/employer/dashboard")

  await expect(page.getByText("Your balance didn't load.")).toBeVisible()
  await expect(
    page
      .getByRole("region", { name: "Credits" })
      .getByRole("link", { name: "Add credits" })
  ).toHaveAttribute("href", "/employer/billing")
  await expect(
    page.getByRole("link", { name: /48\s*Applications received/ })
  ).toBeVisible()
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
