import AxeBuilder from "@axe-core/playwright"

import { expect, fixture, reply, test } from "./fixtures"

test("an employer reads an unlocked candidate and shares their scorecard", async ({
  page,
  api,
  signInAs,
}) => {
  let sent: unknown = null
  await api({
    "POST /user/v1/employer_unlock_candidate/31/share/": async (route) => {
      sent = route.request().postDataJSON()
      await reply(route, {
        success: true,
        data: {
          share_token: "tok_31_abcdef",
          share_url: "https://api.letshyre.ai/s/tok_31_abcdef",
          expires_at: "2026-10-11T00:00:00Z",
          max_views: 5,
        },
      })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/candidates/unlocked")
  await page
    .getByRole("link", { name: "Profile" })
    .filter({ visible: true })
    .click()

  await expect(page).toHaveURL("/employer/candidates/31")
  await expect(
    page.getByRole("heading", { level: 1, name: /Priya Nair/ })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "priya@example.com" })
  ).toHaveAttribute("href", "mailto:priya@example.com")
  await expect(page.getByRole("link", { name: "+91 9876543210" })).toBeVisible()
  // stored as a JSON string by older profiles
  await expect(page.getByText("2022 – now")).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.getByRole("link", { name: "Scorecard" }).click()
  await expect(page).toHaveURL("/employer/candidates/31/scorecard")
  await expect(page.getByRole("heading", { name: "Recording" })).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.getByRole("button", { name: "Share" }).click()
  const dialog = page.getByRole("dialog", {
    name: "Share Priya Nair's scorecard",
  })
  await dialog.getByRole("button", { name: "Create link" }).click()
  await expect(
    dialog.getByText("Choose the job you're sharing for.")
  ).toBeVisible()
  expect(sent).toBeNull()

  await dialog.getByRole("combobox", { name: "For which job" }).click()
  await page.getByRole("option", { name: "Senior React Developer" }).click()
  await dialog.getByLabel("Expires after (days)").fill("7")
  await dialog.getByLabel("View limit").fill("5")
  await dialog.getByRole("button", { name: "Create link" }).click()

  const ready = page.getByRole("dialog", { name: "Link ready" })
  const origin = new URL(page.url()).origin
  await expect(
    ready.getByText(`${origin}/shared-scorecard/tok_31_abcdef`)
  ).toBeVisible()
  await expect(ready.getByText("5 views")).toBeVisible()
  expect(sent).toEqual({
    job_id: "101",
    expires_in_days: 7,
    max_views: 5,
    match_engine: "v1",
  })
})

test("a candidate reads their own scorecard in their own words", async ({
  page,
  signInAs,
}) => {
  await signInAs("candidate")
  await page.goto("/employee/scorecards/9")

  await expect(
    page.getByRole("heading", { level: 1, name: "Your interview scorecard" })
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "Recording" })).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Profile" })).toHaveCount(0)
  await expect(page.getByText("Recommendations")).toHaveCount(0)
})

test("a candidate sees which scorecard employers get and opens an earlier one", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "GET /user/v1/candidate_scorecard/4/": fixture(
      "user.v1.candidate_scorecard.9.json"
    ),
  })
  await signInAs("candidate")
  await page.goto("/employee/scorecards")

  const latest = page.getByRole("region", { name: "frontend developer" })
  await expect(
    latest.getByText("Strong interview", { exact: true })
  ).toBeVisible()
  await expect(
    latest.getByText("Employers you apply to see this one.")
  ).toBeVisible()
  await expect(page.getByText("1 of 3 interviews used (2 left)")).toBeVisible()

  const earlier = page.getByRole("region", { name: "Earlier interviews" })
  await expect(earlier.getByRole("link")).toHaveCount(2)
  await expect(earlier.getByText("Not scored")).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await earlier.getByRole("link", { name: /UI engineer/ }).click()
  await expect(page).toHaveURL("/employee/scorecards/4")
})
