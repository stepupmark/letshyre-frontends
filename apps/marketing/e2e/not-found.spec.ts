import { axe, expect, test } from "./fixtures.ts"

for (const url of ["/404", "/en/does-not-exist", "/xx/nonsense"]) {
  test(`${url}: English 404 inside the site, with a way home`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("404"))
        errors.push(msg.text())
    })
    await page.goto(url)

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This page doesn't exist"
    )
    await expect(page.getByRole("banner")).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Go to home" })
    ).toHaveAttribute("href", "/en")

    await axe(page)
    expect(errors).toEqual([])
  })
}

test("a 404 under a locale switches to that language", async ({ page }) => {
  await page.goto("/hi/does-not-exist")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "यह पेज मौजूद नहीं है"
  )
  await expect(page.locator("html")).toHaveAttribute("lang", "hi")
  await expect(page.getByRole("link", { name: "होम पर जाएं" })).toHaveAttribute(
    "href",
    "/hi"
  )
})

test("the 404 page is not indexed", async ({ request }) => {
  const html = await (await request.get("/404")).text()
  expect(html).toMatch(/<meta name="robots" content="noindex, follow"/)
})
