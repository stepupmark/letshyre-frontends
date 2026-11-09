import { compile } from "@mdx-js/mdx"
import rehypeSlug from "rehype-slug"
import remarkFrontmatter from "remark-frontmatter"
import { describe, expect, it } from "vitest"

import { emptyTopicRedirects } from "../readiness"
import {
  isLive,
  parsePost,
  publishedPosts,
  visiblePosts,
  withBlogIndex,
} from "./post"
import { relatedPosts } from "./related"

const source = (frontmatter: string, body = "Hiring well takes a plan.") =>
  `---\n${frontmatter}\n---\n\n${body}\n`

const valid = `title: Structured interviews
description: How to run one.
audience: employers
topic: interviewing
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
    ["/content/blog/topics/en.mdx", source(valid), /reserved/],
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
      /authors\.ts/,
    ],
  ])("fails the build for %s with a bad post", (file, raw, reason) => {
    expect(() => parsePost(file, raw)).toThrow(reason)
  })
})

describe("isLive", () => {
  const post = (extra = "") =>
    parsePost("/content/blog/structured/en.mdx", source(`${valid}${extra}`))

  it("holds back drafts and posts dated after the build", () => {
    expect(isLive(post(), "2026-11-08")).toBe(true)
    expect(isLive(post(), "2026-11-07")).toBe(false)
    expect(isLive(post("\ndraft: true"), "2026-12-01")).toBe(false)
  })

  it("shows held-back posts only on preview builds, marked as previews", () => {
    const draft = post("\ndraft: true")
    expect(visiblePosts([draft], false)).toEqual([])
    expect(visiblePosts([draft], true)).toEqual([{ ...draft, preview: true }])
  })
})

describe("headings", () => {
  it("gets the same ids rehype-slug gives the rendered headings", async () => {
    const body = [
      "# Title",
      "## Score *each* answer",
      "```md\n## Not a heading\n```",
      "### Score each answer",
      "## [Debrief](/en/employers) on `evidence` ##",
      "## Debrief on evidence",
      "## Entretiens structurés",
    ].join("\n\n")
    const compiled = String(
      await compile(source(valid, body), {
        remarkPlugins: [remarkFrontmatter],
        rehypePlugins: [rehypeSlug],
      })
    )
    const rendered = [
      ...compiled.matchAll(/_components\.h2, \{\s*id: "([^"]+)"/g),
    ].map((m) => m[1])

    const { headings } = parsePost(
      "/content/blog/structured/en.mdx",
      source(valid, body)
    )
    expect(rendered).toHaveLength(4)
    expect(headings.map((h) => h.id)).toEqual(rendered)
    expect(headings.map((h) => h.text)).toEqual([
      "Score each answer",
      "Debrief on evidence",
      "Debrief on evidence",
      "Entretiens structurés",
    ])
  })
})

describe("relatedPosts", () => {
  const post = (
    slug: string,
    audience: string,
    topic: string,
    publishedAt = "2026-10-01"
  ) =>
    parsePost(
      `/content/blog/${slug}/en.mdx`,
      source(
        valid
          .replace("employers", audience)
          .replace("interviewing", topic)
          .replace("2026-11-08", publishedAt)
      )
    )
  const current = post("current", "employers", "interviewing")

  it("prefers the same topic, then the same audience, then the newest", () => {
    const posts = [
      current,
      post("newest", "candidates", "careers", "2026-11-01"),
      post("audience", "employers", "hiring"),
      post("topic", "candidates", "interviewing"),
    ]
    expect(relatedPosts(current, posts).map((p) => p.slug)).toEqual([
      "topic",
      "audience",
      "newest",
    ])
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

  it("sends a topic with no page to the nearest blog index", () => {
    const redirects = new Map(emptyTopicRedirects(posts))
    expect(redirects.get("/en/blogs/topics/hiring")).toBe("/en/blogs")
    expect(redirects.get("/de/blogs/topics/hiring")).toBe("/de/blogs")
    expect(redirects.get("/fr/blogs/topics/hiring")).toBe("/en/blogs")
    expect(redirects.has("/en/blogs/topics/interviewing")).toBe(false)
    expect(redirects.has("/fr/blogs/topics/interviewing")).toBe(false)
  })
})
