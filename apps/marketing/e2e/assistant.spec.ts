import { axe, expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"

test("the assistant opens from home, answers and passes axe", async ({
  page,
}) => {
  await mockApi(page)
  await page.route("**/commonapp/v1/chatbot/chat/", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: { session_id: "s1", response: "Employers **post a job**." },
      },
    })
  )
  await page.goto("/en")

  await page.getByRole("button", { name: "Open chat assistant" }).click()
  const dialog = page.getByRole("dialog", { name: "LetsHyre Assistant" })
  await expect(dialog).toBeVisible()

  await dialog
    .getByRole("button", { name: "How does it work for employers?" })
    .click()
  await expect(dialog.getByText("post a job")).toBeVisible()

  await axe(page, '[role="dialog"]')

  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Open chat assistant" })
  ).toBeFocused()
})

test("other pages don't load the assistant", async ({ page }) => {
  await page.goto("/en/about")
  await expect(
    page.getByRole("button", { name: "Open chat assistant" })
  ).toHaveCount(0)
})
