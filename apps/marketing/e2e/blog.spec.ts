import { expect, test } from "./fixtures.ts"

const POST = "/en/blogs/structured-interview-guide"
const lastSection = { level: 2, name: "Debrief on evidence" } as const

test("a post's full text is in its prerendered HTML", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(POST)
  await expect(page.getByRole("heading", lastSection)).toBeVisible()
  await context.close()
})

test("opening a post from the index loads it in place, without errors", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/en/blogs")
  await page.waitForLoadState("networkidle")
  await page.evaluate(() => {
    document.documentElement.dataset.visited = "index"
  })
  await page
    .getByRole("link", { name: "How to run a structured interview" })
    .click()

  await expect(page).toHaveURL(POST)
  await expect(page.getByRole("heading", lastSection)).toBeVisible()
  // still set means React Router navigated; a full page load would have cleared it
  expect(
    await page.evaluate(() => document.documentElement.dataset.visited)
  ).toBe("index")
  expect(errors).toEqual([])
})
