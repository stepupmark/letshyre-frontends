import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

const DOCS = [
  { url: "/en/terms", title: "Terms and conditions", date: "2026-09-08" },
  { url: "/en/privacy-policy", title: "Privacy policy", date: "2026-07-31" },
  { url: "/en/refund-policy", title: "Refund policy", date: "2026-07-31" },
]

for (const doc of DOCS) {
  test(`${doc.url}: full text, last updated and dated JSON-LD`, async ({
    page,
    request,
  }) => {
    const html = await (await request.get(doc.url)).text()
    expect(html).toContain(`"dateModified":"${doc.date}"`)

    await page.goto(doc.url)
    await expect(
      page.getByRole("heading", { level: 1, name: doc.title })
    ).toBeVisible()
    await expect(page.locator(`time[datetime="${doc.date}"]`)).toBeVisible()
    expect(
      await page.getByRole("article").getByRole("heading", { level: 2 }).count()
    ).toBeGreaterThan(5)
  })
}

test("contents link jumps to the section and marks it current", async ({
  page,
  isMobile,
}) => {
  await page.goto("/en/terms")
  const toc = page.getByRole("navigation", { name: "Contents" })
  if (isMobile) await toc.getByRole("button", { name: "Contents" }).click()

  const link = toc.getByRole("link", {
    name: "7. Payment and Candidate Unlocks",
  })
  await link.click()
  await expect(page).toHaveURL(/#payment-and-candidate-unlocks$/)
  if (isMobile) {
    await expect(toc.getByRole("button")).toContainText(
      "Payment and Candidate Unlocks"
    )
  } else {
    await expect(link).toHaveAttribute("aria-current", "location")
  }

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  expect(violations).toEqual([])
})

test("inline terms explain themselves on click", async ({ page }) => {
  await page.goto("/en/terms")
  await page.getByRole("button", { name: "intended to assist" }).click()
  await expect(page.getByText("Serving as a sign or suggestion")).toBeVisible()
})

test("print hides the navigation", async ({ page }) => {
  await page.goto("/en/privacy-policy")
  await page.emulateMedia({ media: "print" })
  await expect(page.getByRole("navigation", { name: "Contents" })).toBeHidden()
  await expect(
    page.getByRole("heading", { level: 2, name: "11. Contact Us" })
  ).toBeVisible()
})
