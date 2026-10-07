import { expect, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"

// Header tab order and the mobile sheet's focus trap live in header.spec.

test.skip(({ browserName }) => browserName === "webkit", "tab to links")

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("the skip link moves focus past the header", async ({ page }) => {
  await page.goto("/en/about")
  await page.keyboard.press("Tab")
  const skip = page.getByRole("link", { name: "Skip to main content" })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()

  await page.keyboard.press("Enter")
  await page.keyboard.press("Tab")
  const inMain = await page
    .getByRole("main")
    .evaluate((main) => main.contains(document.activeElement))
  expect(inMain).toBe(true)
})

test("tabbing runs header, then main, then footer", async ({ page }) => {
  await page.goto("/en/terms")
  const seen: string[] = []
  for (let i = 0; i < 200 && seen.at(-1) !== "footer"; i++) {
    await page.keyboard.press("Tab")
    const region = await page.evaluate(() => {
      const el = document.activeElement
      if (el?.closest("header")) return "header"
      if (el?.closest("main")) return "main"
      if (el?.closest("footer")) return "footer"
      return "other"
    })
    if (region !== "other" && seen.at(-1) !== region) seen.push(region)
  }
  expect(seen).toEqual(["header", "main", "footer"])
})

test("the language menu opens from the keyboard and gives focus back", async ({
  page,
}) => {
  await page.goto("/en/contact")
  const trigger = page
    .getByRole("contentinfo")
    .getByRole("button", { name: /language/i })
  await trigger.focus()
  await page.keyboard.press("Enter")
  const languages = page.getByRole("dialog")
  await expect(languages).toBeVisible()
  await expect(languages.locator(":focus")).toHaveCount(1)

  await page.keyboard.press("Escape")
  await expect(languages).toBeHidden()
  await expect(trigger).toBeFocused()
})
