import { compile } from "@mdx-js/mdx"
import rehypeSlug from "rehype-slug"
import remarkFrontmatter from "remark-frontmatter"
import { describe, expect, it } from "vitest"

import { emptyTopicRedirects } from "../readiness"
import {
  isLive,
  pageCount,
  pageWindow,
  postsOnPage,
  publishedPosts,
  visiblePosts,
  withBlogIndex,
} from "./list"
import { parsePost } from "./post"
import { relatedPosts } from "./related"
import { blogRoutes } from "./routes"
import { searchPosts } from "./search"

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

describe("sources", () => {
  it("lists external links and studies once each, in reading order", () => {
    const body = [
      "A [new study](https://a.org/x) found it.",
      "```md\n[not a source](https://code.org/z)\n```",
      '<Stat value="9x" label="More" source="https://b.org/y" cite="B report" />',
      "Again, [the same study](https://a.org/x) and [our post](/en/blogs/other).",
      "See [the survey][s].",
      "[s]: https://c.org/s",
    ].join("\n\n")
    const { sources } = parsePost(
      "/content/blog/structured/en.mdx",
      source(valid, body)
    )
    expect(sources).toEqual([
      { url: "https://a.org/x", linkText: "new study" },
      { url: "https://b.org/y", title: "B report" },
      { url: "https://c.org/s", linkText: "the survey" },
    ])
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

  it("routes a glossary only where posts ship, and a tag only once it has three posts", () => {
    const term = (lang: "en" | "de") => ({
      id: "ctc",
      lang,
      term: "CTC",
      short: "Cost to company, the full yearly package.",
      aliases: [],
    })
    const tagged = ["a", "b", "c"].map((slug) => ({
      ...post(slug, "en", "2026-11-01"),
      tags: ["ai" as const],
    }))
    const routes = blogRoutes(
      [...tagged, post("d", "de", "2026-11-01")],
      [term("en"), term("de"), { ...term("en"), lang: "fr" as const }]
    )
    const paths = routes.map((r) => `/${r.lang}${r.path}`)
    expect(paths).toContain("/en/blogs/tags/ai")
    expect(paths).not.toContain("/de/blogs/tags/ai")
    expect(paths).not.toContain("/fr/blogs/glossary")
    expect(routes.find((r) => r.path === "/blogs/glossary")?.locales).toEqual([
      "en",
      "de",
    ])
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

describe("index pages", () => {
  const posts = Array.from({ length: 20 }, (_, i) => i)

  it("leads with ten posts, then nine a page, with none lost or repeated", () => {
    expect(pageCount(10)).toBe(1)
    expect(pageCount(11)).toBe(2)
    expect(pageCount(20)).toBe(3)
    const pages = [1, 2, 3].map((page) => postsOnPage(posts, page))
    expect(pages.map((page) => page.length)).toEqual([10, 9, 1])
    expect(pages.flat()).toEqual(posts)
  })

  it("numbers the first, last and nearby pages, with 0 for a gap", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3])
    expect(pageWindow(1, 9)).toEqual([1, 2, 0, 9])
    expect(pageWindow(5, 9)).toEqual([1, 0, 4, 5, 6, 0, 9])
    expect(pageWindow(4, 9)).toEqual([1, 2, 3, 4, 5, 0, 9])
  })
})

describe("searchPosts", () => {
  const posts = [
    {
      title: "Negotiating your offer",
      description: "CTC and fixed pay",
      topic: "careers",
      minutes: 4,
    },
    {
      title: "Explain a career gap",
      description: "Without apologising",
      topic: "careers",
      minutes: 5,
    },
  ] as const
  const titles = (query: string, length?: "quick" | "standard") =>
    searchPosts(posts, query, "en", () => "Careers", length).map(
      (post) => post.title
    )

  it("matches every word, in any order and any case, across title, description and topic", () => {
    expect(titles("fixed OFFER")).toEqual(["Negotiating your offer"])
    expect(titles("careers gap")).toEqual(["Explain a career gap"])
    expect(titles("offer gap")).toEqual([])
    expect(titles("   ")).toEqual([])
  })

  it("filters by length on its own, with four minutes the last quick read", () => {
    expect(titles("", "quick")).toEqual(["Negotiating your offer"])
    expect(titles("careers", "standard")).toEqual(["Explain a career gap"])
  })
})
