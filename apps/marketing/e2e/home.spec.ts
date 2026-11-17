import { expect, test } from "./fixtures.ts"
import { mockApi } from "./mock-api.ts"

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("hero has one h1, both sign-up paths and stays light on a dark system", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto("/en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Hire on evidence,\s*not on hope\./
  )
  const hero = page.getByRole("region", { name: /Hire on evidence/ })
  await expect(hero.getByRole("link", { name: "I'm hiring" })).toHaveAttribute(
    "href",
    /\/employer\/register$/
  )
  await expect(
    hero.getByRole("link", { name: "I'm looking for a role" })
  ).toHaveAttribute("href", /\/employee\/register$/)
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/)
})

test("FAQ answers are prerendered and open on demand", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/en")).text()
  expect(html).toContain("Up to three, for three different roles")

  await page.goto("/en")
  const question = page.getByText("How many interviews can a candidate take?")
  const answer = page.getByText("Up to three, for three different roles")
  await expect(answer).toBeHidden()
  await question.click()
  await expect(answer).toBeVisible()
})

test("ships SoftwareApplication, FAQPage and WebPage JSON-LD", async ({
  request,
}) => {
  const html = await (await request.get("/en")).text()
  const types = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ].map((m) => (JSON.parse(m[1] ?? "{}") as { "@type": string })["@type"])
  expect(types).toEqual(
    expect.arrayContaining(["SoftwareApplication", "FAQPage", "WebPage"])
  )
})

test("the journey track runs rightwards in RTL and ends on the last step", async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== "chromium",
    "pinned scenes need a desktop viewport"
  )
  await page.goto("/ar")
  const journey = page.getByRole("region", {
    name: "من إعلان الوظيفة إلى أول اتصال.",
  })
  const last = journey.getByRole("region").getByRole("listitem").last()
  // scrolls again on each try, since the scene only listens once hydrated
  await expect
    .poll(async () => {
      await journey.evaluate((section: HTMLElement) => {
        const top = section.getBoundingClientRect().top + window.scrollY
        window.scrollTo(0, top + section.offsetHeight - window.innerHeight - 1)
        window.scrollBy(0, 1)
      })
      return last.evaluate((li) => {
        const { left, right } = li.getBoundingClientRect()
        return left >= 0 && right <= window.innerWidth
      })
    })
    .toBe(true)
})

test("plays through every scene without errors", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("response", (res) => {
    if (res.status() >= 400) errors.push(`${res.status()}: ${res.url()}`)
  })

  await page.goto("/en")
  // pinned scenes only request their photos once scrolled into
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < height; y += 600) {
    await page.mouse.wheel(0, 600)
  }
  await page.waitForLoadState("networkidle")
  for (const photo of await page.locator("picture img").all()) {
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
  }

  if (test.info().project.name === "chromium") {
    const step = page.getByRole("button", { name: /Go to step 3/ })
    await step.click()
    await expect(step).toHaveAttribute("aria-current", "step")
  }

  await page.keyboard.press("Home")
  await page.getByRole("link", { name: "Skip the walkthrough" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("#pricing")).toBeFocused()
  expect(errors).toEqual([])
})
