import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

for (const url of ["/404", "/en/does-not-exist", "/xx/nonsense"]) {
  test(`${url}: English 404 with a home link for every locale`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("404"))
        errors.push(msg.text())
    })
    await page.goto(url)

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "We couldn't find this page"
    )
    await expect(page.getByRole("link", { name: "Go Home" })).toHaveAttribute(
      "href",
      "/en"
    )
    const homes = page.getByRole("navigation", { name: "Language" })
    await expect(homes.getByRole("link")).toHaveCount(19)
    const hindi = homes.getByRole("link", { name: "हिन्दी" })
    await expect(hindi).toHaveAttribute("href", "/hi")
    await expect(hindi).toHaveAttribute("lang", "hi")

    const { violations } = await new AxeBuilder({ page })
      .withTags(WCAG)
      .analyze()
    expect(violations).toEqual([])
    expect(errors).toEqual([])
  })
}

test("the 404 page is not indexed", async ({ request }) => {
  const html = await (await request.get("/404")).text()
  expect(html).toMatch(/<meta name="robots" content="noindex, follow"/)
})
