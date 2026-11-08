import { describe, expect, it } from "vitest"

import { parsePost, publishedPosts, withBlogIndex } from "./post"

const source = (frontmatter: string, body = "Hiring well takes a plan.") =>
  `---\n${frontmatter}\n---\n\n${body}\n`

const valid = `title: Structured interviews
description: How to run one.
publishedAt: 2026-11-08`

describe("parsePost", () => {
  it("reads slug and locale from the path and keeps dates as ISO strings", () => {
    const post = parsePost(
      "/content/blog/structured-interviews/en.mdx",
      source(`${valid}\nupdatedAt: 2026-11-20`)
    )
    expect(post).toMatchObject({
      slug: "structured-interviews",
      lang: "en",
      publishedAt: "2026-11-08",
      updatedAt: "2026-11-20",
      draft: false,
      minutes: 1,
    })
  })

  it.each([
    ["/content/blog/Structured_Interviews/en.mdx", source(valid), /slug/],
    ["/content/blog/structured/xx.mdx", source(valid), /locale/],
    ["/content/blog/structured/en.mdx", "No frontmatter here.", /frontmatter/],
    [
      "/content/blog/structured/en.mdx",
      source(valid.replace("2026-11-08", "8 Nov 2026")),
      /publishedAt/,
    ],
    [
      "/content/blog/structured/en.mdx",
      source(`${valid}\nupdatedAt: 2026-11-01`),
      /before publishedAt/,
    ],
    [
      "/content/blog/structured/en.mdx",
      source(`${valid}\nauthor: someone`),
      /author/,
    ],
  ])("fails the build for %s with a bad post", (file, raw, reason) => {
    expect(() => parsePost(file, raw)).toThrow(reason)
  })
})

describe("readiness", () => {
  const post = (slug: string, lang: "en" | "de", publishedAt: string) =>
    parsePost(
      `/content/blog/${slug}/${lang}.mdx`,
      source(valid.replace("2026-11-08", publishedAt))
    )
  const posts = [
    post("older", "en", "2026-10-01"),
    post("newer", "en", "2026-11-01"),
    post("older", "de", "2026-10-02"),
  ]

  it("ships posts only where the blog's copy is complete, newest first", () => {
    expect(
      publishedPosts(posts, ["en"]).map((p) => `${p.lang}/${p.slug}`)
    ).toEqual(["en/newer", "en/older"])
  })

  it("publishes the index only in locales that have a post", () => {
    const ready = withBlogIndex(
      new Map([
        ["blog", ["en", "de", "fr"]],
        ["about", ["en", "fr"]],
      ]),
      publishedPosts(posts, ["en", "de", "fr"])
    )
    expect(ready.get("blog")).toEqual(["en", "de"])
    expect(ready.get("about")).toEqual(["en", "fr"])
  })
})
