import { axe, expect, fixture, reply, test } from "./fixtures"

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
  // every job starts from a JD, so the review can't be opened directly
  await page.goto("/employer/jobs/new?step=review")
  await expect(
    page.getByRole("heading", { name: "Start with your job description" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Fill it in myself" })
  ).toHaveCount(0)

  await page.getByLabel("Job title").fill("React Developer")
  await page.locator('input[type="file"]').setInputFiles({
    name: "jd.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 jd"),
  })
  await page.getByRole("button", { name: "Fill the form from my JD" }).click()

  await expect(page.getByLabel("Job title")).toHaveValue(
    "Senior React Developer"
  )
  const marks = page.getByText("From your JD", { exact: true })
  await expect(marks).toHaveCount(15)
  // a field the employer changes is theirs now
  await page.getByLabel("City").fill("Secunderabad")
  await expect(marks).toHaveCount(14)
  await axe(page)

  // a refresh keeps the draft and the JD
  await expect(
    page.getByText("Draft saved on this device").first()
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const open = indexedDB.open("letshyre-drafts")
            open.onsuccess = () => {
              // the app may not have created the store yet
              if (!open.result.objectStoreNames.contains("post-job-files")) {
                open.result.close()
                resolve(0)
                return
              }
              const count = open.result
                .transaction("post-job-files")
                .objectStore("post-job-files")
                .count()
              count.onsuccess = () => {
                resolve(count.result)
                open.result.close()
              }
            }
          })
      )
    )
    .toBe(1)
  await page.reload()
  await expect(page.getByLabel("City")).toHaveValue("Secunderabad")
  await expect(marks).toHaveCount(14)
  await expect(page.getByText("Attach your JD again")).toHaveCount(0)

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
    'name="jd_file"; filename="jd.pdf"',
  ])
    expect(posted).toContain(part)
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith("draft:"))
    )
  ).toEqual([])
})

test("jobs can be paused in bulk and the change undone", async ({
  page,
  api,
  signInAs,
}) => {
  const sent: string[] = []
  await api({
    "PATCH /user/v1/employer_job_detail/101/": async (route) => {
      sent.push(route.request().postData() ?? "")
      await reply(route, { success: true })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/jobs")

  await page
    .getByRole("checkbox", { name: "Select Senior React Developer" })
    .filter({ visible: true })
    .check()
  await page
    .getByRole("checkbox", { name: "Select Product Designer" })
    .filter({ visible: true })
    .check()
  const bar = page.getByRole("toolbar")
  await expect(
    bar.getByText("1 waiting for approval won't change")
  ).toBeVisible()
  await expect(bar.getByRole("button", { name: "Reopen" })).toHaveCount(0)
  await axe(page)
  await bar.getByRole("button", { name: "Pause" }).click()
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
  await axe(page)
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

test("a job waiting for approval explains why its status can't change yet", async ({
  page,
  api,
  signInAs,
}) => {
  const job = fixture("user.v1.employer_job_detail.101.json")
  await api({
    "GET /user/v1/employer_job_detail/103/": {
      ...job,
      data: {
        ...(job.data as object),
        id: 103,
        title: "Product Designer",
        job_status: "pending",
      },
    },
  })
  await signInAs("employer")
  await page.goto("/employer/jobs/103")

  await expect(
    page.getByRole("heading", { level: 1, name: "Product Designer" })
  ).toBeVisible()
  await expect(
    page.getByText("You can open, pause or close this job once it's approved.")
  ).toBeVisible()
  await expect(page.getByRole("combobox", { name: "Job status" })).toHaveCount(
    0
  )
  await axe(page)
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
  await axe(page)

  await page.keyboard.press("j")
  await page.keyboard.press("Enter")
  const sheet = page.getByRole("dialog", { name: "Arjun Mehta" })
  await sheet.getByRole("button", { name: "Why this match" }).click()
  await expect(sheet.getByText("Five years of React")).toBeVisible()
  await expect(sheet.getByText("1 of 3")).toBeVisible()
  await page.keyboard.press("j")
  await expect(page.getByRole("dialog", { name: "Kavya Rao" })).toBeVisible()
  await expect(page).toHaveURL(/candidate=7/)

  await page.keyboard.press("Escape")
  await page.getByRole("tab", { name: /Low/ }).click()
  await expect(page.getByRole("row")).toHaveCount(2)
})
