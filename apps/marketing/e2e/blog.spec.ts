import { expect, test } from "./fixtures.ts"

const POST = "/en/blogs/why-we-built-letshyre"
const lastSection = { level: 2, name: "Where LetsHyre is today" } as const

test("a post's full text is in its prerendered HTML", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(POST)
  await expect(page.getByRole("heading", lastSection)).toBeVisible()
  await context.close()
})

test("a post's date reads the same day west of UTC once it hydrates", async ({
  browser,
}) => {
  const context = await browser.newContext({
    timezoneId: "America/Los_Angeles",
  })
  const page = await context.newPage()
  await page.goto(POST)
  await expect(page.getByRole("button", { name: /save/i })).toBeVisible()
  const time = page.locator("header time").first()
  const day = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date((await time.getAttribute("datetime")) ?? ""))
  await expect(time).toContainText(day)
  await context.close()
})

test("searching the index finds a post and opens it in place, without errors", async ({
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
  await page.getByRole("searchbox", { name: "Search posts" }).fill("built")
  await page.getByRole("link", { name: /Why we built LetsHyre/ }).click()

  await expect(page).toHaveURL(POST)
  await expect(page.getByRole("heading", lastSection)).toBeVisible()
  // still set means React Router navigated; a full page load would have cleared it
  expect(
    await page.evaluate(() => document.documentElement.dataset.visited)
  ).toBe("index")
  expect(errors).toEqual([])
})

test("a shared search link opens its results, and they survive a reload", async ({
  page,
}) => {
  await page.goto("/en/blogs?q=built")
  const search = page.getByRole("searchbox", { name: "Search posts" })
  const result = page.getByRole("link", { name: /Why we built LetsHyre/ })
  await expect(search).toHaveValue("built")
  await expect(result).toBeVisible()
  await expect(page.getByRole("heading", { name: "More posts" })).toBeHidden()

  await page.reload()
  await expect(search).toHaveValue("built")
  await expect(result).toBeVisible()
})

test("on a phone, a reader jumps through a post's contents, saves it and finds it again", async ({
  page,
}) => {
  const title = 'How to answer "What are your salary expectations?"'
  const section = "Say a range, in fixed pay"
  await page.setViewportSize({ width: 360, height: 760 })
  await page.goto("/en/blogs/salary-expectations")
  const save = page.getByRole("button", { name: "Save for later" })
  await expect(save).toBeVisible()

  const contents = page.getByRole("navigation", { name: "On this page" })
  await contents.getByText("On this page").click()
  await contents.getByRole("link", { name: section }).click()
  await expect(page).toHaveURL(/#say-a-range/)
  await expect(page.getByRole("heading", { name: section })).toBeInViewport()
  await expect(contents.getByRole("link", { name: section })).toBeHidden()
  await expect(contents).toContainText(section)

  await save.click()
  await expect(
    page.getByRole("button", { name: "Saved", exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "View saved" }).click()
  await expect(page).toHaveURL("/en/blogs?saved=1")
  await expect(page.getByRole("link", { name: title })).toBeVisible()

  const feed = await (await page.request.get("/en/blogs/feed.xml")).text()
  expect(feed).toContain("<rss")
  expect(feed).toContain("/en/blogs/salary-expectations")
})

test("a post's topic links to a topic page that lists it", async ({ page }) => {
  await page.goto(POST)
  await page
    .getByRole("main")
    .getByRole("link", { name: "LetsHyre news", exact: true })
    .click()

  await expect(page).toHaveURL("/en/blogs/topics/news")
  await expect(
    page.getByRole("heading", { level: 1, name: "LetsHyre news" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Why we built LetsHyre" })
  ).toBeVisible()
})
