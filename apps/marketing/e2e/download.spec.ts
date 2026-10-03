import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const envelope = (data: unknown) => ({
  status: 200,
  contentType: "application/json",
  headers: { "access-control-allow-origin": "*" },
  body: JSON.stringify({ success: true, data }),
})

async function mockReleases(page: Page, windows: "ok" | "fail" = "ok") {
  await page.route("**/commonapp/v1/desktop_app/windows/latest/", (route) =>
    windows === "ok"
      ? route.fulfill(
          envelope([
            {
              platform: "windows",
              available: true,
              version: "1.4.4",
              original_filename: "LetsHyre-Setup-1.4.4.exe",
            },
            { platform: "mac", available: false },
          ])
        )
      : route.fulfill({
          status: 503,
          headers: { "access-control-allow-origin": "*" },
        })
  )
  await page.route("**/commonapp/v1/desktop_app/mac/latest/", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ success: false, message: "Not found" }),
    })
  )
}

test("offers the Windows installer and marks macOS as coming soon", async ({
  page,
}) => {
  await mockReleases(page)
  await page.goto("/en/download")

  const windows = page.getByRole("region", { name: "Windows" })
  const link = windows.getByRole("link", { name: "Download for Windows" })
  await expect(link).toHaveAttribute(
    "href",
    /\/commonapp\/v1\/desktop_app\/windows\/download\/$/
  )
  await expect(windows.getByText("Version 1.4.4")).toBeVisible()
  await expect(
    page.getByRole("region", { name: "macOS" }).getByText("Coming Soon")
  ).toBeVisible()

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("shows a retry when releases can't be loaded", async ({ page }) => {
  await mockReleases(page, "fail")
  await page.goto("/en/download")

  const windows = page.getByRole("region", { name: "Windows" })
  await expect(windows.getByRole("button", { name: "Retry" })).toBeVisible({
    timeout: 10_000,
  })
})

test("links sign in to the candidate app", async ({ page }) => {
  await mockReleases(page)
  await page.goto("/en/download")
  await expect(page.getByRole("link", { name: "sign in" })).toHaveAttribute(
    "href",
    /\/employee\/sign-in$/
  )
})

test("ships SoftwareApplication JSON-LD", async ({ request }) => {
  const html = await (await request.get("/en/download")).text()
  expect(html).toContain('"@type":"SoftwareApplication"')
  expect(html).toContain('"operatingSystem":"Windows"')
})
