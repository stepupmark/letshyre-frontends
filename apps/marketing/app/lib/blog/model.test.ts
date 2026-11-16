import { describe, expect, it } from "vitest"

import { blogModel } from "./model"

const post = (slug: string, lang: string, publishedAt: string, body = "") =>
  [
    `/content/blog/${slug}/${lang}.mdx`,
    `---
title: ${slug}
description: About ${slug}.
audience: employers
topic: hiring
publishedAt: ${publishedAt}
---

Hiring well takes a plan. ${body}
`,
  ] as const

const term = (id: string, lang: string) =>
  [
    `/content/glossary/${id}/${lang}.mdx`,
    `---
term: ${id}
short: A short definition of ${id} that is long enough.
---

More about ${id}.
`,
  ] as const

const files = {
  posts: [
    post("today", "en", "2026-11-16"),
    post("tomorrow", "en", "2026-11-17"),
    post("german", "de", "2026-11-01"),
  ],
  terms: [term("ctc", "en"), term("ctc", "de")],
  guides: [],
  series: [],
}

describe("blogModel", () => {
  it("decides what ships from the build's date, not the clock", () => {
    const slugs = (date: string) =>
      blogModel(files, {
        previews: false,
        blogLocales: ["en"],
        date,
      }).posts.map((p) => p.slug)
    expect(slugs("2026-11-16")).toEqual(["today"])
    expect(slugs("2026-11-17")).toEqual(["tomorrow", "today"])
  })

  it("keeps glossary entries and routes to the locales that have a post", () => {
    const model = blogModel(files, {
      previews: false,
      blogLocales: ["en"],
      date: "2026-11-16",
    })
    expect(model.terms.map((t) => `${t.lang}/${t.id}`)).toEqual(["en/ctc"])
    expect(new Set(model.routes.map((r) => r.lang))).toEqual(new Set(["en"]))
  })

  it("fails the build on a term with no entry in the post's locale", () => {
    expect(() =>
      blogModel(
        {
          ...files,
          posts: [post("x", "en", "2026-11-01", '<Term id="gst">GST</Term>')],
        },
        { previews: false, blogLocales: ["en"], date: "2026-11-16" }
      )
    ).toThrow(/Term id="gst"/)
  })
})
