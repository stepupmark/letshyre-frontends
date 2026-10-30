import { axe, expect, reply, test } from "./fixtures"

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
)
const pdf = (name: string) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4 test"),
})

test("a new candidate sets up their profile from photo to resume review", async ({
  page,
  api,
  signInAs,
}) => {
  let complete = false
  let sent = ""
  let polls = 0
  await api({
    "POST /user/v1/candidate_profile/": async (route) => {
      const body = route.request().postData()
      if (body) {
        sent = body
        complete = true
      }
      await reply(route, {
        success: true,
        data: { is_profile_complete: complete },
      })
    },
    "POST /user/v1/candidate_resume_ai/upload/": (route) =>
      reply(route, { success: true, data: { job_id: "job-1" } }),
    "GET /user/v1/candidate_resume_ai/status/job-1/": (route) =>
      reply(route, {
        success: true,
        data:
          ++polls < 2
            ? { status: "processing" }
            : {
                status: "completed",
                ai_resume_id: 88,
                suggested_roles: {
                  suggested_roles: ["Frontend Developer", "UI Engineer"],
                },
              },
      }),
    "GET /user/v1/candidate_resume_ai/review_data/job-1/": (route) =>
      reply(route, {
        success: true,
        data: {
          data: {
            skills: ["React", "CSS"],
            experience: [
              {
                role: "Frontend Developer",
                company: "Finch",
                duration: "2 years 6 months",
              },
            ],
            education: [],
            projects: [],
            certifications: [],
          },
        },
      }),
    "POST /user/v1/candidate_resume_ai/skills_for_role/": (route) =>
      reply(route, {
        success: true,
        data: { skills: ["React", "TypeScript", "Accessibility"] },
      }),
  })
  await signInAs("candidate")
  await page.goto("/employee/jobs")
  await expect(page).toHaveURL("/employee/onboarding")

  await page.getByLabel("Gender").click()
  await page.getByRole("option", { name: "Female" }).click()
  const dob = page.getByRole("group", { name: "Date of birth" })
  await dob.getByLabel("Day").fill("31")
  await dob.getByLabel("Month").fill("2")
  await dob.getByLabel("Year").fill("1999")
  await page.getByLabel("Aadhaar number").fill("2345 6789 0125")
  await page.getByLabel("Address", { exact: true }).fill("12 Marine Drive")
  await page.getByLabel("City", { exact: true }).fill("Kochi")
  await page.getByLabel("State", { exact: true }).fill("Kerala")
  await page.getByLabel("PIN code").fill("682031")
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(
    page.getByText("That date doesn't exist. Check the day and month.")
  ).toBeVisible()
  await expect(
    page.getByText("That isn't a valid Aadhaar number. Check the 12 digits.")
  ).toBeVisible()
  await dob.getByLabel("Day").fill("12")
  await expect(dob.getByLabel("Month")).toHaveValue("02")
  await page.getByLabel("Aadhaar number").fill("234567890124")
  await expect(page.getByLabel("Aadhaar number")).toHaveValue("2345 6789 0124")
  await page.getByRole("button", { name: "Continue" }).click()

  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText("Add a photo to continue.")).toBeVisible()
  await page
    .getByLabel("Upload a photo")
    .setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG })
  await expect(
    page.getByRole("img", { name: "Your profile photo" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Continue" }).click()

  await page.getByLabel("Current or last company").fill("Finch")
  await page.getByRole("button", { name: "Choose from a calendar" }).click()
  await page.getByRole("gridcell").filter({ hasText: /^28$/ }).first().click()
  await expect(
    page.getByRole("group", { name: "Last working day" }).getByLabel("Day")
  ).toHaveValue("28")
  await page.getByLabel("Current pay (LPA)").fill("12")
  await page.getByLabel("Expected pay (LPA)").fill("10")
  await page.getByLabel("Industry you want to work in").click()
  await page.getByRole("option", { name: "Information technology" }).click()
  await page.getByLabel("Where you'd like to work").fill("Kochi, Bengaluru")
  await page.getByLabel("Where you'd like to work").press("Enter")
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(
    page.getByText("Expected pay can't be lower than your current pay.")
  ).toBeVisible()
  await page.getByLabel("Expected pay (LPA)").fill("16")
  await page.getByLabel("Desired pay (LPA)").fill("18")
  await page.getByRole("button", { name: "Continue" }).click()

  await page.getByLabel("Notice period proof", { exact: true }).click()
  await page.getByRole("option", { name: "Relieving letter" }).click()
  const files = page.locator('input[type="file"]')
  await files.nth(0).setInputFiles(pdf("resignation.pdf"))
  await files.nth(0).setInputFiles(pdf("experience.pdf"))
  await files.nth(0).setInputFiles(pdf("relieving.pdf"))

  // the photo and letters survive a refresh, once they're in IndexedDB
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const open = indexedDB.open("letshyre-drafts")
            open.onsuccess = () => {
              const count = open.result
                .transaction("candidate-onboarding-files")
                .objectStore("candidate-onboarding-files")
                .count()
              count.onsuccess = () => {
                resolve(count.result)
                open.result.close()
              }
            }
          })
      )
    )
    .toBe(4)
  await page.waitForTimeout(800)
  await page.reload()
  await expect(page.getByText("relieving.pdf")).toBeVisible()
  await page.getByRole("button", { name: "Continue" }).click()

  await expect(page.getByRole("heading", { name: "Your resume" })).toBeVisible()
  await files.nth(0).setInputFiles(pdf("resume.pdf"))
  await expect(page.getByText("Reading your resume")).toBeVisible()
  await expect(
    page.getByRole("radio", { name: "Frontend Developer" })
  ).toHaveAttribute("aria-checked", "true")
  await expect(page.getByText("Accessibility")).toBeVisible()
  await page.getByRole("button", { name: "Remove CSS" }).click()
  await page.getByLabel("Add a skill").first().fill("Playwright")
  await page.getByLabel("Add a skill").first().press("Enter")
  await axe(page)
  await page.getByRole("button", { name: "Continue" }).click()

  await expect(page.getByText("Frontend Developer, 2 skills")).toBeVisible()
  await page.getByRole("button", { name: "Finish" }).click()
  await expect(
    page.getByRole("heading", { name: "You're all set" })
  ).toBeVisible()

  const field = (name: string) =>
    new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)`).exec(sent)?.[1]
  expect(field("aadhar_number")).toBe("234567890124")
  expect(field("gender")).toBe("Female")
  expect(field("location")).toBe("Kochi")
  expect(field("address")).toBe("12 Marine Drive, Kochi, Kerala 682031")
  expect(field("preferred_industry")).toBe("Information technology")
  expect(field("preferred_locations")).toBe('["Kochi","Bengaluru"]')
  expect(field("notice_period_prof_type")).toBe("Relieving Letter")
  expect(field("selected_role")).toBe("Frontend Developer")
  expect(field("resume_id")).toBe("88")
  expect(field("total_experience_years")).toBe("2.5")
  expect(JSON.parse(field("parsed_resume_data") ?? "{}")).toMatchObject({
    skills: ["React", "Playwright"],
  })
  expect(sent).toContain('name="profile_photo"; filename="me.png"')
  expect(sent).toContain('name="notice_period_prof"; filename="relieving.pdf"')
})
