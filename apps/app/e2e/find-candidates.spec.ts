import { axe, expect, fixture, reply, test } from "./fixtures"

const SEARCH = "GET /user/v1/employer_interviewed_candidates_search/"
const [unlockedRow, lockedRow] = (
  fixture("user.v1.employer_interviewed_candidates_search.json").data as {
    results: Record<string, unknown>[]
  }
).results

const interviews = (row: Record<string, unknown> | undefined) =>
  `GET /user/v1/employer_candidate_interviews/${String(row?.candidate_id)}/`

test("an employer searches interviewed candidates, filters, pages and unlocks one in the dialog", async ({
  page,
  api,
  signInAs,
}) => {
  test.skip(
    test.info().project.name === "mobile",
    "drives the desktop popovers; the sheet holds the same fields"
  )
  const asked: Record<string, string>[] = []
  let sent: unknown = null
  await api({
    [SEARCH]: async (route) => {
      const query = Object.fromEntries(
        new URL(route.request().url()).searchParams
      )
      asked.push(query)
      const none = query.location === "Nowhere"
      await reply(route, {
        success: true,
        data: {
          count: none ? 0 : 12,
          total_pages: none ? 0 : 2,
          results: none
            ? []
            : [unlockedRow, { ...lockedRow, already_unlocked: sent !== null }],
        },
      })
    },
    [interviews(unlockedRow)]: (route) =>
      reply(route, {
        data: [
          {
            interview_id: unlockedRow?.interview_id,
            role: "Devops Engineer",
            score: 55,
            unlocked: true,
          },
        ],
      }),
    [interviews(lockedRow)]: (route) =>
      reply(route, {
        data: [
          {
            interview_id: lockedRow?.interview_id,
            role: "Devops Engineer",
            score: 16.5,
            unlocked: sent !== null,
          },
        ],
      }),
    "POST /user/v1/employer_unlock_candidate/": async (route) => {
      sent = route.request().postDataJSON()
      await reply(route, { success: true })
    },
  })
  const last = () => asked.at(-1)

  await signInAs("employer")
  await page.goto("/employer/find-candidates")
  await expect(page.getByText("Search across every AI interview")).toBeVisible()
  expect(asked, "no search before the box has text").toEqual([])

  await page.getByLabel("Search by role or skill").fill("devops")
  await expect(page.getByText("12 candidates match “devops”")).toBeVisible()
  await expect.poll(last).toEqual({ search: "devops", page: "1" })
  await expect(page.getByText("Devops", { exact: true }).first()).toBeVisible()

  await page.getByRole("button", { name: "Next page" }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect.poll(last).toEqual({ search: "devops", page: "2" })

  await page.getByRole("button", { name: "Experience" }).click()
  await page.getByRole("button", { name: "2–5", exact: true }).click()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Education" }).click()
  await page.getByRole("button", { name: "B.Tech", exact: true }).click()
  await expect.poll(last).toEqual({
    search: "devops",
    page: "1",
    experience_min: "2",
    experience_max: "5",
    education: "B.Tech",
  })
  await axe(page)

  await page.getByRole("button", { name: "Location" }).click()
  await page.getByLabel("City").fill("Nowhere")
  await page.getByRole("button", { name: "Apply" }).click()
  await expect(page.getByText("No one matches “devops”")).toBeVisible()
  await page.getByRole("button", { name: "Clear filters" }).first().click()
  await expect(page).not.toHaveURL(/location=|education=|experience_/)
  await expect(page.getByText("12 candidates match “devops”")).toBeVisible()

  const dialog = page.getByRole("dialog")
  const meera = page.getByRole("button", { name: /Meera Nair/ })
  await expect(dialog).toHaveCount(0)
  await meera.click()
  await expect(
    dialog.getByRole("heading", { name: "Meera Nair" })
  ).toBeVisible()
  await expect(page).toHaveURL(/candidate=/)
  await page.reload()
  await expect(
    dialog.getByRole("heading", { name: "Meera Nair" })
  ).toBeVisible()
  await axe(page)

  await dialog.getByRole("checkbox").check()
  await dialog.getByRole("button", { name: "Unlock · 1 credit" }).click()
  await expect
    .poll(() => sent)
    .toEqual({
      candidate: lockedRow?.candidate_id,
      interview: [lockedRow?.interview_id],
    })
  await expect(
    dialog.getByText("Everything for this candidate is unlocked.")
  ).toBeVisible()
  await expect(dialog.getByText("Unlocked for you")).toBeVisible()

  await dialog.getByRole("button", { name: "Previous" }).click()
  await expect(
    dialog.getByRole("heading", { name: "Ravi Kumar" })
  ).toBeVisible()
  await expect(dialog.getByRole("heading", { name: "Meera Nair" })).toHaveCount(
    0
  )
  await dialog.press("j")
  await expect(
    dialog.getByRole("heading", { name: "Meera Nair" })
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(meera).toBeFocused()
  await expect(
    page
      .locator("[data-row]")
      .getByText("Unlocked", { exact: true })
      .filter({ visible: true })
  ).toHaveCount(2)
  await expect(
    page.locator("[data-row]").getByText("Viewed", { exact: true })
  ).toHaveCount(2)

  const calls = asked.length
  await page.getByRole("button", { name: "Clear search" }).click()
  await expect(page.getByText("Search across every AI interview")).toBeVisible()
  expect(asked).toHaveLength(calls)
})
