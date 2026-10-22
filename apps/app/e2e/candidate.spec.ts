import { axe, expect, fixture, reply, test } from "./fixtures"

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
    .getByRole("link", { name: "Priya Nair", exact: true })
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
  await axe(page)

  await page.getByRole("link", { name: "Scorecard" }).click()
  await expect(page).toHaveURL("/employer/candidates/31/scorecard")
  await expect(page.getByRole("heading", { name: "Recording" })).toBeVisible()
  await axe(page)

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

test("an employer picks three unlocked candidates, compares them and drops one", async ({
  page,
  api,
  signInAs,
}) => {
  const list = fixture("user.v1.employer_unlock_candidate.json")
  const report = fixture("user.v1.employer_unlock_candidate.31.scorecard.json")
  const data = list.data as { results: Record<string, unknown>[] }
  const people = [
    { id: 31, candidate_name: "Priya Nair", ai_overall_score: 78 },
    { id: 32, candidate_name: "Rahul Verma", ai_overall_score: 52 },
    { id: 33, candidate_name: "Meera Iyer", ai_overall_score: 31 },
  ]
  const scorecard = (name: string, overall: number) => ({
    ...report,
    data: {
      ...(report.data as object),
      candidate_name: name,
      overall_score: overall,
    },
  })
  await api({
    "GET /user/v1/employer_unlock_candidate/": {
      ...list,
      data: {
        ...data,
        count: 3,
        results: people.map((p) => ({ ...data.results[0], ...p })),
      },
    },
    "GET /user/v1/employer_unlock_candidate/32/scorecard/": scorecard(
      "Rahul Verma",
      52
    ),
    "GET /user/v1/employer_unlock_candidate/33/scorecard/": scorecard(
      "Meera Iyer",
      31
    ),
  })
  await signInAs("employer")
  await page.goto("/employer/candidates/unlocked")

  const bar = page.getByRole("toolbar", { name: "Bulk actions" })
  for (const p of people) {
    await page
      .getByRole("checkbox", { name: `Select ${p.candidate_name}` })
      .filter({ visible: true })
      .check()
    if (p.id === 31) await expect(bar.getByText("Pick one more")).toBeVisible()
  }
  await axe(page)
  await bar.getByRole("link", { name: "Compare" }).click()

  await expect(page).toHaveURL("/employer/candidates/compare?ids=31,32,33")
  const table = page.getByRole("table", { name: "Compare candidates" })
  await expect(
    table.getByRole("link", { name: "Rahul Verma", exact: true })
  ).toBeVisible()
  const overall = table.getByRole("row", { name: /^Overall score/ })
  await expect(overall.getByRole("cell").first()).toContainText("78Highest")
  await axe(page)

  await table
    .getByRole("link", { name: "Remove Meera Iyer from the comparison" })
    .click()
  await expect(page).toHaveURL("/employer/candidates/compare?ids=31,32")
  await expect(table.getByRole("link", { name: "Meera Iyer" })).toHaveCount(0)
  await expect(table.getByRole("link", { name: /^Remove/ })).toHaveCount(0)
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
  await axe(page)

  await earlier.getByRole("link", { name: /UI engineer/ }).click()
  await expect(page).toHaveURL("/employee/scorecards/4")
})
