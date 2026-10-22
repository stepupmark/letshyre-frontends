import AxeBuilder from "@axe-core/playwright"

import { expect, fixture, reply, test } from "./fixtures"

const FIND = "GET /user/v1/candidate_find_jobs/"

test("a candidate searches, saves the search, applies and follows the application", async ({
  page,
  api,
  signInAs,
}) => {
  test.skip(
    test.info().project.name === "mobile",
    "the filter rail is desktop only; the phone test covers the sheet"
  )
  const searches: URLSearchParams[] = []
  let applied: unknown = null
  const jobs = fixture("user.v1.candidate_find_jobs.json")
  await api({
    [FIND]: async (route) => {
      searches.push(new URL(route.request().url()).searchParams)
      await reply(route, jobs)
    },
    "POST /user/v1/candidate_jobs/": async (route) => {
      applied = route.request().postDataJSON()
      await reply(route, { success: true, data: {} }, 201)
    },
  })
  await signInAs("candidate")
  await page.goto("/employee/jobs")

  await expect(page.getByRole("heading", { name: "2 jobs" })).toBeVisible()
  await page
    .getByRole("combobox", { name: "Title, skill or keyword" })
    .fill("react")
  await page.getByRole("textbox", { name: "City" }).fill("Pune")
  await page.getByRole("button", { name: "Search", exact: true }).click()
  await expect(page).toHaveURL("/employee/jobs?q=react&location=Pune")

  const filters = page.getByRole("complementary", { name: /Filters/ })
  await filters.getByRole("checkbox", { name: "Full time" }).click()
  await filters.getByRole("checkbox", { name: "Remote" }).click()
  await filters.getByRole("button", { name: "6+", exact: true }).click()
  await expect(page).toHaveURL(
    "/employee/jobs?q=react&location=Pune&type=full_time&type=remote&pay=6"
  )
  await expect.poll(() => searches.at(-1)?.get("salary_min")).toBe("6")
  expect(searches.at(-1)?.get("employment_type")).toBe("full_time,remote")
  expect(searches.at(-1)?.get("job_search")).toBe("react")

  await page.getByRole("button", { name: "Remove Remote" }).click()
  await expect(page).toHaveURL(
    "/employee/jobs?q=react&location=Pune&type=full_time&pay=6"
  )
  await page.getByRole("combobox", { name: "Sort by" }).click()
  await page.getByRole("option", { name: "Highest salary" }).click()
  await expect.poll(() => searches.at(-1)?.get("sort_by")).toBe("salary")

  await page.getByRole("button", { name: "Save search" }).click()
  await page.getByRole("button", { name: "Clear all" }).click()
  await expect(page).toHaveURL("/employee/jobs?sort=salary")
  await filters
    .getByRole("button", {
      name: "react · Pune · Full time · 6+ LPA",
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(
    "/employee/jobs?q=react&location=Pune&type=full_time&pay=6"
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.getByRole("button", { name: "Frontend Developer" }).click()
  const sheet = page.getByRole("dialog", { name: "Frontend Developer" })
  await expect(sheet.getByText("₹8–14 LPA")).toBeVisible()
  await sheet.getByRole("button", { name: "Apply" }).click()
  await expect(page.getByText("Applied. The employer can see")).toBeVisible()
  expect(applied).toEqual({ job: "7d1c2b9e-1111-4c1a-9a51-2f3b4c5d6e01" })
  await expect(sheet.getByText("Applied", { exact: true })).toBeVisible()
  await sheet.getByRole("link", { name: "See my applications" }).click()

  await expect(page).toHaveURL("/employee/applications")
  const card = page.getByRole("article").filter({ hasText: "UI Engineer" })
  await expect(
    card.getByRole("list", { name: "Application progress" })
  ).toBeVisible()
  await expect(card.getByText("Kestrel Pay · applied")).toBeVisible()
  await expect(
    card.getByRole("link", { name: "How the interview works" })
  ).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test("on a phone, filters open in a sheet and apply as they change", async ({
  page,
  api,
  signInAs,
}) => {
  const searches: URLSearchParams[] = []
  await page.setViewportSize({ width: 360, height: 760 })
  await api({
    [FIND]: async (route) => {
      searches.push(new URL(route.request().url()).searchParams)
      await reply(route, fixture("user.v1.candidate_find_jobs.json"))
    },
  })
  await signInAs("candidate")
  await page.goto("/employee/jobs")

  await page.getByRole("button", { name: "Filters", exact: true }).click()
  const sheet = page.getByRole("dialog", { name: "Filters" })
  await sheet.getByRole("checkbox", { name: "Internship" }).click()
  await sheet.getByRole("switch", { name: "Hide jobs I've applied to" }).click()
  await expect.poll(() => searches.at(-1)?.get("job_type")).toBe("not_applied")
  expect(searches.at(-1)?.get("employment_type")).toBe("internship")
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await sheet.getByRole("button", { name: "Show 2 jobs" }).click()
  await expect(
    page.getByRole("button", { name: /Filters\s*2 filters applied/ })
  ).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test("a candidate reads their profile as employers see it, without editing", async ({
  page,
  signInAs,
}) => {
  await signInAs("candidate")
  await page.goto("/employee/profile")

  await expect(
    page.getByRole("heading", { level: 1, name: /Meera Iyer/ })
  ).toBeVisible()
  await expect(page.getByText("Bengaluru", { exact: true })).toBeVisible()
  await expect(page.getByRole("tab", { name: /Work/ })).toBeVisible()
  await expect(page.getByRole("button", { name: /Edit|Add/ })).toHaveCount(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})
