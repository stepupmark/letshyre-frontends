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

test("a new employer completes company details and documents, then reaches the dashboard", async ({
  page,
  api,
  signInAs,
}) => {
  let sent = ""
  await api({
    "PATCH /user/v1/employer_kyc/": async (route) => {
      sent = route.request().postData() ?? ""
      await reply(route, { success: true })
    },
  })
  await signInAs("employerNew")
  await page.goto("/employer/dashboard")
  await expect(page).toHaveURL("/employer/onboarding")
  await expect(page.getByLabel("Official email")).toHaveValue("new@test.in")

  // a link past unfinished steps lands on the first one
  await page.goto("/employer/onboarding?step=documents")
  await expect(
    page.getByRole("heading", { name: "Company details" })
  ).toBeVisible()

  await page.getByLabel("Company name").fill("Acme Labs")
  await page.getByLabel("Website").fill("acme.in")
  await page.getByLabel("Website").blur()
  await expect(page.getByLabel("Website")).toHaveValue("https://acme.in")
  await page.getByLabel("Industry").click()
  await page.getByRole("option", { name: "Information technology" }).click()
  await page
    .getByLabel("Company LinkedIn page")
    .fill("https://in.linkedin.com/company/acme")
  await page
    .getByLabel("What does your company do?")
    .fill("We build hiring software for small teams.")
  await axe(page)
  await page.getByRole("button", { name: "Continue" }).click()

  await page
    .getByLabel("Company registration number")
    .fill("U72900TG2024PTC123456")
  await page.getByLabel("PAN", { exact: true }).fill("abcde1234f")
  await expect(page.getByLabel("PAN", { exact: true })).toHaveValue(
    "ABCDE1234F"
  )
  await page.getByLabel("GSTIN", { exact: true }).fill("36ABCDE1234F1Z")
  await page.getByLabel("Street address").fill("1 Hitech City")
  await page.getByLabel("City").fill("Hyderabad")
  await page.getByLabel("State").fill("Telangana")
  await page.getByLabel("PIN code").fill("500081")
  await axe(page)
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page.getByText("A GSTIN has 15 characters")).toBeVisible()
  await page.getByLabel("GSTIN", { exact: true }).fill("36ABCDE1234F1Z5")

  // a refresh keeps the place and the typed details
  await page.waitForTimeout(800)
  await page.reload()
  await expect(page.getByLabel("GSTIN", { exact: true })).toHaveValue(
    "36ABCDE1234F1Z5"
  )
  await page.getByRole("button", { name: "Continue" }).click()

  const files = page.locator('input[type="file"]')
  await files.nth(0).setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: PNG,
  })
  await files.nth(0).setInputFiles(pdf("certificate.pdf"))
  await files.nth(0).setInputFiles(pdf("gst.pdf"))

  // picked files survive a refresh, once they're written to IndexedDB
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const open = indexedDB.open("letshyre-drafts")
            open.onsuccess = () => {
              const count = open.result
                .transaction("employer-onboarding-files")
                .objectStore("employer-onboarding-files")
                .count()
              count.onsuccess = () => {
                resolve(count.result)
                open.result.close()
              }
            }
          })
      )
    )
    .toBe(3)
  await page.reload()
  await expect(page.getByText("gst.pdf")).toBeVisible()
  await page.getByRole("button", { name: "Finish" }).click()
  await expect(page.getByText("Add this document")).toBeVisible()
  await axe(page)
  await files.nth(0).setInputFiles(pdf("lease.pdf"))
  await page.getByRole("button", { name: "Finish" }).click()

  await expect(
    page.getByRole("heading", { name: "Thanks, your details are in" })
  ).toBeVisible()
  for (const part of [
    'name="company_name"',
    "Acme Labs",
    'name="pan_number"',
    "ABCDE1234F",
    "1 Hitech City, Hyderabad, Telangana 500081",
    'filename="logo.png"',
    'filename="lease.pdf"',
  ])
    expect(sent).toContain(part)

  await page.getByRole("link", { name: "Go to the dashboard" }).click()
  await expect(page).toHaveURL("/employer/dashboard")
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
})
