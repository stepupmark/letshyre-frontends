import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const CORS = { "access-control-allow-origin": "*" }

async function fillIn(page: Page) {
  await page.getByRole("main").getByLabel("Full name").fill("Ada Lovelace")
  await page
    .getByRole("main")
    .getByRole("textbox", { name: "Email address" })
    .fill("ada@example.com")
  await page.getByRole("main").getByLabel("Subject").fill("Hiring help")
  await page
    .getByRole("main")
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("We would like to try LetsHyre for three roles.")
  await page.getByRole("button", { name: "Send message" }).click()
}

test("validation errors are announced and accessible", async ({ page }) => {
  await page.goto("/en/contact")
  await expect(page.getByRole("button", { name: "Send message" })).toBeEnabled()
  await page.getByRole("button", { name: "Send message" }).click()

  await expect(page.getByText("Enter your name")).toBeVisible()
  await expect(page.getByRole("main").getByLabel("Full name")).toHaveAttribute(
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
  await expect(page.getByRole("button", { name: "Send message" })).toBeEnabled()
  await fillIn(page)

  await expect(
    page.getByRole("heading", { name: "Message sent" })
  ).toBeFocused()
  expect(body).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com" })
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("ships ContactPage JSON-LD", async ({ request }) => {
  const html = await (await request.get("/en/contact")).text()
  expect(html).toContain('"@type":"ContactPage"')
  expect(html).toContain('"mainEntity":{"@id"')
})
