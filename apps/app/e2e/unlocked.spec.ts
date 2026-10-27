import { axe, expect, fixture, reply, test } from "./fixtures"

const row = (
  fixture("user.v1.employer_unlock_candidate.json").data as {
    results: Record<string, unknown>[]
  }
).results[0]

test("an employer filters unlocked candidates by skill and experience and pages through them", async ({
  page,
  api,
  signInAs,
}) => {
  test.skip(
    test.info().project.name === "mobile",
    "drives the desktop popovers; the sheet holds the same fields"
  )
  const asked: URLSearchParams[] = []
  await api({
    "GET /user/v1/employer_unlock_candidate/": async (route) => {
      const query = new URL(route.request().url()).searchParams
      asked.push(query)
      const none = query.get("skills")?.includes("Rust")
      await reply(route, {
        success: true,
        data: {
          count: none ? 0 : 21,
          total_pages: none ? 0 : 2,
          results: none ? [] : [{ ...row, id: Number(query.get("page")) }],
        },
      })
    },
  })
  const last = () => Object.fromEntries(asked.at(-1) ?? [])

  await signInAs("employer")
  await page.goto("/employer/candidates/unlocked")
  await expect(page.getByText("21 unlocked candidates")).toBeVisible()
  await expect.poll(last).toEqual({ page: "1", limit: "20" })

  await page.getByRole("button", { name: "Next page" }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect.poll(last).toEqual({ page: "2", limit: "20" })

  await page.getByRole("button", { name: "Skills" }).click()
  const skills = page.getByLabel("Skills to match")
  await skills.fill("Git,")
  await skills.fill("python")
  await skills.press("Enter")
  await page.keyboard.press("Escape")
  await expect(page.getByText("21 candidates match")).toBeVisible()
  await expect
    .poll(last)
    .toEqual({ page: "1", limit: "20", skills: "Git,python" })
  await expect(page).not.toHaveURL(/page=/)

  await page.getByRole("button", { name: "Experience" }).click()
  await page.getByLabel("At least").fill("5")
  await page.getByLabel("At most").fill("2")
  await expect(page.getByRole("alert")).toHaveText(
    "At least can't be more than at most."
  )
  await page.getByRole("button", { name: "2–5", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect
    .poll(last)
    .toMatchObject({ experience_min: "2", experience_max: "5" })
  await axe(page)

  await page.getByRole("button", { name: "Remove Git" }).click()
  await expect.poll(() => last().skills).toBe("python")

  await page.getByRole("button", { name: "Skills" }).click()
  await page.getByLabel("Skills to match").fill("Rust")
  await page.getByLabel("Skills to match").press("Enter")
  await page.keyboard.press("Escape")
  await expect(page.getByText("No unlocked candidates match")).toBeVisible()

  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page.getByText("21 unlocked candidates")).toBeVisible()
  await expect(page).toHaveURL(/\/employer\/candidates\/unlocked$/)
})
