import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

import { mockApi } from "./mock-api.ts"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const axe = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test.describe("desktop header", () => {
  test.skip(({ isMobile }) => isMobile, "desktop layout")
  // WebKit skips links on Tab unless the OS setting is on
  test.skip(({ browserName }) => browserName === "webkit", "tab to links")

  test.use({ viewport: { width: 1280, height: 800 } })

  test("tab order runs skip link, logo, nav, language, get started", async ({
    page,
  }) => {
    await page.goto("/en/pricing")
    const banner = page.getByRole("banner")
    const nav = banner.getByRole("navigation", { name: "Primary navigation" })
    const order = [
      page.getByRole("link", { name: "Skip to main content" }),
      banner.getByRole("link", { name: "LetsHyre logo" }),
      nav.getByRole("link", { name: "How It Works" }),
      nav.getByRole("link", { name: "AI Interview" }),
      nav.getByRole("link", { name: "Pricing" }),
      nav.getByRole("link", { name: "About" }),
      nav.getByRole("link", { name: "Contact" }),
      banner.getByRole("button", { name: /language/i }),
      banner.getByRole("link", { name: "Get Started" }),
    ]
    for (const target of order) {
      await page.keyboard.press("Tab")
      await expect(target).toBeFocused()
    }
    await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "aria-current",
      "page"
    )
  })

  test("collapses into the menu when the links stop fitting", async ({
    page,
  }) => {
    await page.goto("/en")
    const banner = page.getByRole("banner")
    const menu = banner.getByRole("button", { name: "Toggle navigation" })
    await expect(menu).toBeHidden()
    await expect(
      banner.getByRole("navigation", { name: "Primary navigation" })
    ).toBeVisible()

    // a long translation, simulated
    await banner
      .getByRole("link", { name: "Contact" })
      .evaluate((link) => (link.textContent = "Contact ".repeat(20)))

    await expect(menu).toBeVisible()
    await expect(
      banner.getByRole("navigation", { name: "Primary navigation" })
    ).toBeHidden()
    const box = await banner.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(1280)
  })

  test("adds a border once the page scrolls", async ({ page }) => {
    await page.goto("/en")
    const banner = page.getByRole("banner")
    await expect(banner).not.toHaveAttribute("data-scrolled")
    await page.mouse.wheel(0, 600)
    await expect(banner).toHaveAttribute("data-scrolled", "true")
  })
})

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 800 } })
  test.skip(({ browserName }) => browserName === "webkit", "tab to links")

  test("traps focus in the sheet and returns it to the trigger", async ({
    page,
  }) => {
    await page.goto("/en")
    const trigger = page
      .getByRole("banner")
      .getByRole("button", { name: "Toggle navigation" })
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" })
    ).toBeHidden()

    await trigger.focus()
    await page.keyboard.press("Enter")
    const dialog = page.getByRole("dialog", { name: "Site navigation" })
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole("navigation", { name: "Mobile navigation" })
    ).toBeVisible()

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab")
      const inside = await dialog.evaluate((node) =>
        node.contains(document.activeElement)
      )
      expect(inside).toBe(true)
    }

    await axe(page)

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("navigates and closes when a link is picked", async ({ page }) => {
    await page.goto("/en")
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Toggle navigation" })
      .click()
    const dialog = page.getByRole("dialog", { name: "Site navigation" })
    await dialog.getByRole("link", { name: "Pricing" }).click()
    await expect(page).toHaveURL(/\/en\/pricing$/)
    await expect(dialog).toBeHidden()
  })
})

test("footer has its landmark, link columns and labelled social links", async ({
  page,
}) => {
  await page.goto("/en")
  const footer = page.getByRole("contentinfo")
  for (const name of ["Product", "Candidates", "Company", "Legal"]) {
    await expect(footer.getByRole("heading", { name })).toBeVisible()
  }
  await expect(
    footer.getByRole("link", { name: "LetsHyre on LinkedIn" })
  ).toHaveAttribute("href", /linkedin\.com/)
  await expect(
    footer.getByRole("link", { name: "Privacy Policy" })
  ).toHaveAttribute("href", "/en/policy")
})

test("newsletter validates, then confirms inline", async ({ page }) => {
  await page.goto("/en")
  const footer = page.getByRole("contentinfo")
  await footer.getByRole("button", { name: "Subscribe" }).click()
  await expect(footer.getByRole("alert")).toHaveText(
    "Enter your email address."
  )
  await axe(page)

  await footer.getByLabel("Email address").fill("me@company.com")
  await footer.getByRole("button", { name: "Subscribe" }).click()
  await expect(footer.getByRole("status")).toHaveText(
    "Subscription saved successfully."
  )
})
