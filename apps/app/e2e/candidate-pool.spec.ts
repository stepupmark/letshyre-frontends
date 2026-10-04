import AxeBuilder from "@axe-core/playwright"

import { expect, reply, test } from "./fixtures"

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
  await page.goto("/employer/candidate-pool")

  await expect(page).toHaveURL(/jobId=101/)
  await expect(page.getByText("3 of 40 candidates match")).toBeVisible()
  await page
    .getByRole("button", { name: /Arjun Mehta/ })
    .filter({ visible: true })
    .click()
  const panel = page.getByRole("dialog", { name: "Arjun Mehta" })
  await expect(panel.getByText("This job's role")).toBeVisible()
  const unlock = panel.getByRole("button", { name: /^Unlock ·/ })
  await expect(unlock).toHaveText("Unlock · 0 credits")
  await expect(unlock).toBeDisabled()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

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
  await expect(page).toHaveURL("/employer/unlocked-candidates")
  await expect(
    page.getByText("Priya Nair").filter({ visible: true })
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
  await page.goto("/employer/candidate-pool?jobId=101&candidate=5")

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
    `/employer/billing?next=${encodeURIComponent("/employer/candidate-pool?jobId=101&candidate=5")}`
  )
  await expect(panel.getByRole("button", { name: /^Unlock ·/ })).toHaveCount(0)
})
