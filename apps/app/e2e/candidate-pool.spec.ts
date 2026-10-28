import { axe, expect, reply, test } from "./fixtures"

const INTERVIEWS = "GET /user/v1/employer_candidate_interviews/5/"

test("an employer unlocks a candidate after seeing the cost and the balance left", async ({
  page,
  api,
  signInAs,
}) => {
  let sent: unknown = null
  let credits = 12
  await api({
    "GET /payment/v1/employer_credits/": (route) =>
      reply(route, { data: { available_credits: credits } }),
    [INTERVIEWS]: (route) =>
      reply(route, {
        data: [
          {
            interview_id: 501,
            role: "Senior React Developer",
            score: 81,
            unlocked: sent !== null,
          },
          {
            interview_id: 502,
            role: "Node.js Developer",
            score: 55,
            unlocked: sent !== null,
          },
          { interview_id: 503, role: "QA Engineer", score: 40, unlocked: true },
        ],
      }),
    "POST /user/v1/employer_unlock_candidate/": async (route) => {
      sent = route.request().postDataJSON()
      credits = 10
      await reply(route, { success: true })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/candidates")

  await expect(page).toHaveURL(/jobId=101/)
  const overview = page.getByRole("region", { name: "AI matched candidates" })
  await expect(overview).toContainText("3")
  await expect(overview).toContainText("of 40 in the pool")
  await page
    .getByRole("button", { name: /Arjun Mehta/ })
    .filter({ visible: true })
    .first()
    .click()
  const panel = page.getByRole("dialog", { name: "Arjun Mehta" })
  await expect(panel.getByText("This job's role")).toBeVisible()
  const unlock = panel.getByRole("button", { name: /^Unlock( ·|$)/ })
  await expect(unlock).toHaveText("Unlock")
  await expect(unlock).toBeDisabled()
  await axe(page)

  await panel.getByRole("checkbox").nth(0).check()
  await panel.getByRole("checkbox").nth(1).check()
  await expect(panel.getByRole("checkbox").nth(2)).toBeDisabled()
  await unlock.click()

  const confirm = page.getByRole("dialog", { name: "Unlock Arjun Mehta?" })
  await expect(
    confirm.getByText(
      "This uses 2 credits and can't be undone. You'll have 10 left."
    )
  ).toBeVisible()
  await confirm.getByRole("button", { name: "Unlock · 2 credits" }).click()

  await expect(page.getByText("Arjun Mehta unlocked")).toBeVisible()
  await expect(
    panel.getByText("Everything for this candidate is unlocked.")
  ).toBeVisible()
  expect(sent).toEqual({ candidate: 5, interview: [501, 502] })

  await panel.getByRole("link", { name: "See unlocked candidates" }).click()
  await expect(page).toHaveURL("/employer/candidates/unlocked")
  await expect(
    page
      .getByRole("link", { name: "Priya Nair", exact: true })
      .filter({ visible: true })
  ).toBeVisible()
})

test("without enough credits, unlocking leads to a top-up that comes back here", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "GET /payment/v1/employer_credits/": (route) =>
      reply(route, { data: { available_credits: 1 } }),
  })
  await signInAs("employer")
  await page.goto("/employer/candidates?jobId=101&candidate=5")

  const panel = page.getByRole("dialog", { name: "Arjun Mehta" })
  await panel.getByRole("checkbox").nth(0).check()
  await expect(panel.getByRole("button", { name: /^Unlock ·/ })).toBeEnabled()
  await panel.getByRole("checkbox").nth(1).check()

  await expect(
    panel.getByText("This needs 2 credits and you have 1.", { exact: false })
  ).toBeVisible()
  await expect(
    panel.getByRole("link", { name: "Add credits" })
  ).toHaveAttribute(
    "href",
    `/employer/billing?next=${encodeURIComponent("/employer/candidates?jobId=101&candidate=5")}`
  )
  await expect(
    panel.getByRole("button", { name: /^Unlock( ·|$)/ })
  ).toHaveCount(0)
})

test("a link to a job that isn't open says so and offers an open one", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "GET /user/v1/employer_job_detail/300/": (route) =>
      reply(route, { detail: "Not found." }, 404),
  })
  await signInAs("employer")
  await page.goto("/employer/candidates?jobId=300")

  await expect(page.getByText("This job isn't open any more")).toBeVisible()
  await axe(page)
  await page.getByRole("button", { name: "View an open job" }).click()
  await expect(page).toHaveURL(/jobId=101/)
  await expect(
    page.getByRole("region", { name: "AI matched candidates" })
  ).toBeVisible()
})

test("when the balance fails, the unlock panel says why and can retry", async ({
  page,
  api,
  signInAs,
}) => {
  let fail = true
  await api({
    "GET /payment/v1/employer_credits/": (route) =>
      fail
        ? reply(route, { detail: "Server error" }, 500)
        : reply(route, { data: { available_credits: 4 } }),
  })
  await signInAs("employer")
  await page.goto("/employer/candidates?jobId=101&candidate=5")

  const panel = page.getByRole("dialog", { name: "Arjun Mehta" })
  await expect(panel.getByText("Balance didn't load.")).toBeVisible()
  await panel.getByRole("checkbox").nth(0).check()
  await expect(
    panel.getByText("Your balance needs to load before you can unlock.")
  ).toBeVisible()
  await expect(panel.getByRole("button", { name: /^Unlock ·/ })).toBeDisabled()

  fail = false
  await panel.getByRole("button", { name: "Try again" }).click()
  await expect(panel.getByText("Balance 4")).toBeVisible()
  await expect(panel.getByRole("button", { name: /^Unlock ·/ })).toBeEnabled()
})
