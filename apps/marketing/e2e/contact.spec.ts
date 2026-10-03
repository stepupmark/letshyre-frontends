import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const CORS = { "access-control-allow-origin": "*" }

async function fillIn(page: Page) {
  await page.getByRole("main").getByLabel("Full Name").fill("Ada Lovelace")
  await page
    .getByRole("main")
    .getByLabel("Email Address")
    .fill("ada@example.com")
  await page.getByRole("main").getByLabel("Subject").fill("Hiring help")
  await page
    .getByLabel("Message Details")
    .fill("We would like to try LetsHyre for three roles.")
  await page.getByRole("button", { name: "Send Message" }).click()
}

test("validation errors are announced and accessible", async ({ page }) => {
  await page.goto("/en/contact")
  await expect(page.getByRole("button", { name: "Send Message" })).toBeEnabled()
  await page.getByRole("button", { name: "Send Message" }).click()

  await expect(
    page.getByText("Name must be at least 2 characters")
  ).toBeVisible()
  await expect(page.getByRole("main").getByLabel("Full Name")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("sends the message and confirms inline", async ({ page }) => {
  let body: unknown
  await page.route("**/commonapp/v1/contact/", async (route) => {
    if (route.request().method() === "OPTIONS")
      return route.fulfill({
        headers: {
          ...CORS,
          "access-control-allow-headers": "content-type, accept",
          "access-control-allow-methods": "POST",
        },
      })
    body = route.request().postDataJSON()
    return route.fulfill({
      contentType: "application/json",
      headers: CORS,
      body: JSON.stringify({ success: true, message: "Received" }),
    })
  })
  await page.goto("/en/contact")
  await expect(page.getByRole("button", { name: "Send Message" })).toBeEnabled()
  await fillIn(page)

  await expect(
    page.getByRole("heading", { name: "Message Sent!" })
  ).toBeFocused()
  expect(body).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com" })
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("keeps the message when sending fails", async ({ page }) => {
  await page.route("**/commonapp/v1/contact/", (route) => route.abort())
  await page.goto("/en/contact")
  await expect(page.getByRole("button", { name: "Send Message" })).toBeEnabled()
  await fillIn(page)

  await expect(page.getByRole("alert")).toContainText(
    "We couldn't reach our server."
  )
  await expect(page.getByRole("main").getByLabel("Full Name")).toHaveValue(
    "Ada Lovelace"
  )
})

test("prefills the subject for sales", async ({ page }) => {
  await page.goto("/en/contact?topic=sales")
  await expect(page.getByRole("main").getByLabel("Subject")).toHaveValue(
    "Custom plan enquiry"
  )
})

test("ships ContactPage JSON-LD", async ({ request }) => {
  const html = await (await request.get("/en/contact")).text()
  expect(html).toContain('"@type":"ContactPage"')
})
