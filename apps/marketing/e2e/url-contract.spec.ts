import { fileURLToPath } from "node:url"
import { LOCALES } from "@workspace/i18n"

import { expect, test } from "./fixtures.ts"
import { indexPagePath, postPath, topicPath } from "../app/lib/blog/paths.ts"
import { pageCount, TOPICS } from "../app/lib/blog/post.ts"
import { MOVED_PATHS } from "../app/lib/pages.ts"
import { readiness } from "../app/lib/readiness.ts"

const { posts } = readiness(fileURLToPath(new URL("..", import.meta.url)))

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

  test("old page URLs move permanently", async ({ request }) => {
    for (const [from, to] of Object.entries(MOVED_PATHS)) {
      const res = await request.get(`/hi${from}`, { maxRedirects: 0 })
      expect(res.status(), from).toBe(301)
      expect(res.headers().location).toBe(`/hi${to}`)
    }
  })

  test("blog URLs answer as the contract says", async ({ request }) => {
    const post = posts.find((p) => p.lang === "en")
    test.skip(!post, "no English post")
    if (!post) return
    const untranslated = LOCALES.find(
      (lang) => !posts.some((p) => p.slug === post.slug && p.lang === lang)
    )
    const empty = TOPICS.find((topic) => !posts.some((p) => p.topic === topic))

    const expected: [string, number, string?][] = [
      ["/en/blogs", 200],
      [`/en${postPath(post.slug)}`, 200],
      [`/en${topicPath(post.topic)}`, 200],
      ["/en/blogs/topics", 301, "/en/blogs"],
      ["/en/blogs/topics/nonsense", 404],
      ["/en/blogs/page/1", 404],
    ]
    const pages = pageCount(posts.filter((p) => p.lang === "en").length)
    if (pages > 1) expected.push([`/en${indexPagePath(pages)}`, 200])
    expected.push([`/en${indexPagePath(pages + 1)}`, 404])
    if (untranslated)
      expected.push([
        `/${untranslated}${postPath(post.slug)}`,
        302,
        `/en${postPath(post.slug)}`,
      ])
    if (empty) expected.push([`/en${topicPath(empty)}`, 302, "/en/blogs"])

    for (const [path, status, location] of expected) {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status(), path).toBe(status)
      if (location) expect(res.headers().location, path).toBe(location)
    }
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
