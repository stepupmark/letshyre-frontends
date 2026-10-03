import { expect, test } from "@playwright/test"

test.describe("url contract", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "server behaviour")

  test("/ redirects to /en", async ({ request }) => {
    const res = await request.get("/", { maxRedirects: 0 })
    expect(res.status()).toBe(301)
    expect(res.headers().location).toBe("/en")
  })

  test("trailing slash redirects to the canonical URL", async ({ request }) => {
    const res = await request.get("/en/", { maxRedirects: 0 })
    expect(res.status()).toBe(301)
    expect(res.headers().location).toBe("/en")
  })

  test("canonical URL is served without a redirect", async ({ request }) => {
    const res = await request.get("/en", { maxRedirects: 0 })
    expect(res.status()).toBe(200)
  })

  test("unknown pages are real 404s", async ({ request }) => {
    for (const path of [
      "/xx/nonsense",
      "/en/does-not-exist",
      "/assets/nope.js",
    ]) {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status(), path).toBe(404)
    }
  })
})
