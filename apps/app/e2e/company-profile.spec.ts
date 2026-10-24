import { axe, expect, reply, test } from "./fixtures"

test("an employer reviews their company and edits it, with a guard on leaving", async ({
  page,
  api,
  signInAs,
}) => {
  let sent: string | null = null
  await api({
    "PATCH /user/v1/employer_kyc/": (route) => {
      sent = route.request().postData()
      return reply(route, { success: true })
    },
  })
  await signInAs("employer")
  await page.goto("/employer/company")

  await expect(page.getByRole("heading", { name: "Acme Labs" })).toBeVisible()
  await expect(page.getByText("Verified").first()).toBeVisible()
  await expect(page.getByText("Neha Kapoor")).toBeVisible()
  await expect(page.getByText("•••• 234F")).toBeVisible()
  await page.getByRole("button", { name: "Show PAN" }).click()
  await expect(page.getByText("ABCDE1234F")).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Registration certificate" })
  ).toBeVisible()
  await axe(page)

  await page.getByRole("link", { name: "Edit company" }).click()
  await expect(
    page.getByRole("heading", { name: "Edit company" })
  ).toBeVisible()
  const save = page.getByRole("button", { name: "Save changes" })
  await expect(save).toBeDisabled()

  const linkedin = page.getByLabel("LinkedIn page")
  await linkedin.fill("https://example.com/acme")
  await expect(page.getByText("Unsaved changes")).toBeVisible()
  await save.click()
  await expect(
    page.getByText("Enter a linkedin.com link, or leave it empty.")
  ).toBeVisible()
  await expect(linkedin).toBeFocused()
  await axe(page)

  await page
    .getByRole("link", { name: "Back to company profile", exact: true })
    .click()
  const leave = page.getByRole("dialog", { name: "Leave without saving?" })
  await leave.getByRole("button", { name: "Cancel" }).click()
  await expect(leave).toBeHidden()
  await expect(page).toHaveURL(/\/employer\/company\/edit$/)

  await linkedin.fill("https://www.linkedin.com/company/acme-labs")
  await save.click()
  await expect(page.getByText("Company details saved")).toBeVisible()
  await expect(page).toHaveURL(/\/employer\/company$/)
  expect(sent).toContain("acme-labs")
})

test("an empty field links straight to its input in the edit form", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "GET /user/v1/employer_profile/": (route) =>
      reply(route, {
        data: {
          name: "Neha Kapoor",
          kyc: { company_name: "Acme Labs", kyc_status: "pending" },
        },
      }),
  })
  await signInAs("employer")
  await page.goto("/employer/company")

  await expect(page.getByText("Under review").first()).toBeVisible()
  await expect(page.getByText("No documents on file.")).toBeVisible()
  await page.getByRole("link", { name: "Add your LinkedIn page" }).click()
  await expect(page.getByLabel("LinkedIn page")).toBeFocused()
})

test("a failed save keeps the edits and says so", async ({
  page,
  api,
  signInAs,
}) => {
  await api({
    "PATCH /user/v1/employer_kyc/": (route) => reply(route, {}, 500),
  })
  await signInAs("employer")
  await page.goto("/employer/company/edit")

  const address = page.getByLabel("Address")
  await address.fill("2nd floor, Indiranagar, Bengaluru")
  await page.getByRole("button", { name: "Save changes" }).click()
  await expect(
    page.getByText("That didn't save. Your changes are still here; try again.")
  ).toBeVisible()
  await expect(address).toHaveValue("2nd floor, Indiranagar, Bengaluru")
})

test("when the profile fails to load, it says so and can retry", async ({
  page,
  api,
  signInAs,
}) => {
  let failing = true
  await api({
    "GET /user/v1/employer_profile/": (route) =>
      failing
        ? reply(route, {}, 500)
        : reply(route, { data: { kyc: { company_name: "Acme Labs" } } }),
  })
  await signInAs("employer")
  await page.goto("/employer/company")

  await expect(page.getByText("Company profile didn't load")).toBeVisible()
  failing = false
  await page.getByRole("button", { name: "Try again" }).click()
  await expect(page.getByRole("heading", { name: "Acme Labs" })).toBeVisible()
})
