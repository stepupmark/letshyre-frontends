import AxeBuilder from "@axe-core/playwright"

import { expect, reply, test } from "./fixtures"

const PARSED = {
  success: true,
  data: {
    parse_response: {
      flat: {
        job_title: "Senior React Developer",
        work_mode: "Hybrid",
        employment_type: "Full Time",
        industry_type: "Information technology",
        required_skills: ["React", "TypeScript"],
        experience_min: 4,
        experience_max: 7,
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        minimum_education: "B.Tech",
        responsibilities: ["Build the review screens"],
        job_description: "We build hiring software.",
        number_of_openings: 2,
        application_deadline: "31-12-2099",
      },
    },
  },
}

test("an employer posts a job from their JD after checking what it filled", async ({
  page,
  api,
  signInAs,
}) => {
  let posted = ""
  await api({
    "POST /user/v1/employer_job_jd_ai/parse/": (route) => reply(route, PARSED),
    "POST /user/v1/employer_jobs/": async (route) => {
      posted = route.request().postData() ?? ""
      await reply(route, { success: true, data: { id: 101 } })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/jobs/new")

  await page.getByRole("button", { name: "Fill the form from my JD" }).click()
  await expect(page.getByText("Choose your JD file first")).toBeVisible()
  await page.locator('input[type="file"]').setInputFiles({
    name: "jd.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 jd"),
  })
  await page.getByLabel("Job title").fill("React Developer")
  await page.getByRole("button", { name: "Fill the form from my JD" }).click()

  await expect(page.getByText(/We filled 15 fields from your JD/)).toBeVisible()
  await expect(page.getByLabel("Job title")).toHaveValue(
    "Senior React Developer"
  )
  const marks = page.getByText("From your JD", { exact: true })
  await expect(marks).toHaveCount(15)
  // a field the employer changes is theirs now
  await page.getByLabel("City").fill("Secunderabad")
  await expect(marks).toHaveCount(14)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  // a refresh keeps the draft
  await expect(page.getByText("Draft saved on this device")).toBeVisible()
  await page.reload()
  await expect(page.getByLabel("City")).toHaveValue("Secunderabad")
  await expect(marks).toHaveCount(14)

  await page.getByRole("button", { name: "Preview" }).click()
  const preview = page.getByRole("dialog", { name: "Senior React Developer" })
  await expect(preview.getByText("We build hiring software.")).toBeVisible()
  await expect(preview.getByText("4-7 years")).toBeVisible()
  await page.keyboard.press("Escape")

  await page.getByRole("button", { name: "Post job" }).click()
  await expect(page).toHaveURL("/employer/jobs/101")
  for (const part of [
    '"description":"We build hiring software."',
    '"city":"Secunderabad"',
    '"work_mode":"hybrid"',
    '"skills_required":["React","TypeScript"]',
    '"application_deadline":"2099-12-31"',
  ])
    expect(posted).toContain(part)
  expect(
    await page.evaluate(() => localStorage.getItem("draft:v1:post-job"))
  ).toBeNull()
})

test("jobs can be paused in bulk and the change undone", async ({
  page,
  api,
  signInAs,
}) => {
  test.skip(
    test.info().project.name === "mobile",
    "bulk selection is in the desktop table"
  )
  const sent: string[] = []
  await api({
    "PATCH /user/v1/employer_job_detail/101/": async (route) => {
      sent.push(route.request().postData() ?? "")
      await reply(route, { success: true })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/jobs")

  await expect(
    page.getByRole("row", { name: /Product Designer/ })
  ).toContainText("Waiting for approval")
  await page
    .getByRole("checkbox", { name: "Select Senior React Developer" })
    .check()
  await page.getByRole("toolbar").getByRole("button", { name: "Pause" }).click()
  await expect(page.getByText("1 job is now paused")).toBeVisible()
  await page.getByRole("button", { name: "Undo" }).click()
  await expect(page.getByText("Changes undone")).toBeVisible()
  expect(sent).toEqual(['{"status":"Paused"}', '{"status":"Open"}'])
})

test("a job is edited in place", async ({ page, api, signInAs }) => {
  let sent: Record<string, unknown> = {}
  await api({
    "PATCH /user/v1/employer_job_detail/101/": async (route) => {
      sent = route.request().postDataJSON() as Record<string, unknown>
      await reply(route, { success: true })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/jobs/101")

  await expect(
    page.getByRole("heading", { name: "Senior React Developer" })
  ).toBeVisible()
  await expect(page.getByText("Mentor two developers")).toBeVisible()
  await page.getByRole("button", { name: "Edit" }).click()
  await page.getByLabel("Openings").fill("3")
  await page.getByRole("button", { name: "Save changes" }).click()

  await expect(page.getByText("Changes saved")).toBeVisible()
  await expect(page).toHaveURL("/employer/jobs/101")
  expect(sent).toMatchObject({
    number_of_openings: 3,
    industry_type: "it",
    salary_range: "18 - 28 LPA",
    responsibilities: [
      "Own the candidate review screens",
      "Mentor two developers",
    ],
  })
})

test("applicants are reviewed best match first, one after another", async ({
  page,
  signInAs,
}) => {
  test.skip(
    test.info().project.name === "mobile",
    "j/k review is a keyboard feature"
  )
  await signInAs("employer")
  await page.goto("/employer/jobs/101/applicants")

  await expect(page.getByText("3 applied · best match first")).toBeVisible()
  const rows = page.getByRole("row")
  await expect(rows.nth(1)).toContainText("Arjun Mehta")
  await expect(rows.nth(1)).toContainText("Strong match")
  await expect(rows.nth(3)).toContainText("Meera Iyer")
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.keyboard.press("j")
  await page.keyboard.press("Enter")
  const sheet = page.getByRole("dialog", { name: "Arjun Mehta" })
  await expect(sheet.getByText("Five years of React")).toBeVisible()
  await expect(sheet.getByText("1 of 3")).toBeVisible()
  await page.keyboard.press("j")
  await expect(page.getByRole("dialog", { name: "Kavya Rao" })).toBeVisible()
  await expect(page).toHaveURL(/candidate=7/)

  await page.keyboard.press("Escape")
  await page.getByRole("tab", { name: /Low/ }).click()
  await expect(page.getByRole("row")).toHaveCount(2)
})
