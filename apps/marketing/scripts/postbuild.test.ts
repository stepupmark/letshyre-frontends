import { createHash } from "node:crypto"
import { describe, expect, it } from "vitest"

import {
  initialScriptsOf,
  injectMetaPolicy,
  nginxMap,
  parseNginxMap,
} from "../../../tooling/csp"
import { parsePost } from "../app/lib/blog/post"
import { pagePolicy } from "./csp"
import { renderFeed } from "./feed"
import { renderLlms } from "./llms"
import { checkPage, width } from "./seo-checks"
import { renderRobots, renderSitemap } from "./sitemap"

const SITE = "https://letshyre.ai"

const page = (head: string, body = "<h1>Pricing</h1>") =>
  `<!DOCTYPE html><html lang="en" dir="ltr"><head><meta charSet="utf-8"/>${head}</head><body>${body}</body></html>`

const goodHead = [
  `<title>Pricing: Pay per Candidate Unlock | letshyre.ai</title>`,
  `<meta name="description" content="Start with free credits and buy more only when you need them, with no subscription at all."/>`,
  `<link rel="canonical" href="${SITE}/en/pricing"/>`,
  `<link rel="alternate" hrefLang="en" href="${SITE}/en/pricing"/>`,
  `<link rel="alternate" hrefLang="de" href="${SITE}/de/pricing"/>`,
  `<link rel="alternate" hrefLang="x-default" href="${SITE}/en/pricing"/>`,
  `<meta property="og:title" content="Pricing"/>`,
  `<meta property="og:url" content="${SITE}/en/pricing"/>`,
  `<meta property="og:image" content="${SITE}/og/pricing.jpg"/>`,
  `<meta property="og:locale" content="en_US"/>`,
  `<meta name="twitter:card" content="summary_large_image"/>`,
  `<script type="application/ld+json">{"@type":"Organization","@id":"#org"}</script>`,
  `<script type="application/ld+json">{"@type":"WebSite","publisher":{"@id":"#org"}}</script>`,
].join("")

const options = {
  site: SITE,
  production: true,
  fileExists: (path: string) => path === "/og/pricing.jpg",
  isPage: (path: string) => ["/en", "/en/pricing"].includes(path),
}

describe("checkPage", () => {
  const input = { lang: "en", path: "/pricing", locales: ["en", "de"] } as const

  it("passes a complete page", () => {
    expect(checkPage({ ...input, html: page(goodHead) }, options)).toEqual([])
  })

  it("flags hreflang that disagrees with readiness", () => {
    expect(
      checkPage(
        { ...input, locales: ["en"], html: page(goodHead) },
        options
      ).join()
    ).toMatch(/hreflang/)
  })

  it("flags dangling JSON-LD ids, extra h1s and noindex in production", () => {
    const html = page(
      goodHead.replace(
        `"@id":"#org"}</script><script`,
        `"@id":"#x"}</script><script`
      ) + `<meta name="robots" content="noindex"/>`,
      "<h1>a</h1><h1>b</h1>"
    )
    const problems = checkPage({ ...input, html }, options).join("\n")
    expect(problems).toMatch(/@id not defined: #org/)
    expect(problems).toMatch(/one <h1>, found 2/)
    expect(problems).toMatch(/production page is noindex/)
  })

  it("flags links that would go through a redirect", () => {
    const body = `<h1>Pricing</h1><a href="/en">Home</a><a href="/en/pricing#faq">FAQ</a><a href="/hi">Hindi</a><a href="/en/interview-guide?x=1">Guide</a><a href="/og/pricing.jpg">Card</a><a href="https://letshyre.ai/employer/register">Join</a>`
    const problems = checkPage(
      { ...input, html: page(goodHead, body) },
      options
    )
    expect(problems).toEqual([
      "links to pages that aren't published here: /hi, /en/interview-guide",
    ])
  })

  it("flags a share url or document language that isn't the page's", () => {
    const html = page(goodHead)
      .replace(`content="${SITE}/en/pricing"/>`, `content="${SITE}/en"/>`)
      .replace('lang="en"', 'lang="de"')
    expect(checkPage({ ...input, html }, options)).toEqual([
      `og:url isn't ${SITE}/en/pricing`,
      "<html lang> isn't en",
    ])
  })

  it("counts CJK as double width", () => {
    expect(width("採用")).toBe(4)
  })
})

describe("sitemap and robots", () => {
  it("lists every ready locale with alternates and x-default", () => {
    const xml = renderSitemap(SITE, [
      { path: "/about", locales: ["en", "ar"], lastmod: () => "2026-10-01" },
    ])
    expect(xml.match(/<loc>/g)).toHaveLength(2)
    expect(xml).toContain(`<loc>${SITE}/ar/about</loc>`)
    expect(xml).toContain(`hreflang="x-default" href="${SITE}/en/about"`)
  })

  it("only lets crawlers in on production", () => {
    expect(renderRobots(SITE, false)).toBe("User-agent: *\nDisallow: /\n")
    expect(renderRobots(SITE, true)).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })
})

describe("llms.txt", () => {
  const txt = renderLlms(
    SITE,
    { name: "LetsHyre", summary: "Hire on evidence." },
    [
      {
        id: "terms",
        path: "/terms",
        title: "Terms and conditions | letshyre.ai",
        description: "The terms.",
      },
      {
        id: "pricing",
        path: "/pricing",
        title: "Pricing | letshyre.ai",
        description: "Credit plans.",
      },
      { id: "home", path: "", title: "Home", description: "Hire on evidence." },
    ],
    [
      {
        path: "/blogs/structured-interviews",
        title: "Structured interviews | letshyre.ai",
        description: "How to run one.",
      },
    ]
  )

  it("groups English pages in a fixed order and leaves home to the summary", () => {
    expect(txt).toMatch(/^# LetsHyre\n\n> Hire on evidence\.\n/)
    expect(txt).toContain(
      `## Employers\n\n- [Pricing](${SITE}/en/pricing): Credit plans.`
    )
    expect(txt.indexOf("## Employers")).toBeLessThan(txt.indexOf("## Optional"))
    expect(txt).not.toContain("[Home]")
    expect(txt).not.toContain("## Company")
  })

  it("lists posts under Blog, before the optional pages", () => {
    expect(txt).toContain(
      `## Blogs

- [Structured interviews](${SITE}/en/blogs/structured-interviews): How to run one.`
    )
    expect(txt.indexOf("## Blogs")).toBeLessThan(txt.indexOf("## Optional"))
  })
})

describe("feed", () => {
  it("escapes post copy and links every item to its locale's page", () => {
    const post = parsePost(
      "/content/blog/pay-bands/de.mdx",
      `---
title: Pay bands & <offers>
description: Why "fair" pay needs bands.
audience: employers
topic: hiring
publishedAt: 2026-11-02
---

Body.`
    )
    const xml = renderFeed(
      SITE,
      "de",
      { title: "LetsHyre blog", description: "Notes" },
      [post]
    )
    expect(xml).toContain("<title>Pay bands &amp; &lt;offers&gt;</title>")
    expect(xml).toContain(
      "<description>Why &quot;fair&quot; pay needs bands.</description>"
    )
    expect(xml).toContain(`<link>${SITE}/de/blogs/pay-bands</link>`)
    expect(xml).toContain("<pubDate>Mon, 02 Nov 2026 00:00:00 GMT</pubDate>")
  })
})

describe("csp", () => {
  const html = page(
    `<script>window.a=1</script><script type="application/ld+json">{}</script><script type="module" src="/assets/x.js"></script>`
  )

  it("hashes executable inline scripts only", () => {
    const hash = createHash("sha256").update("window.a=1").digest("base64")
    const policy = pagePolicy(html, "https://api.letshyre.ai")
    expect(policy).toContain(`script-src 'self' 'sha256-${hash}' https://`)
    expect(policy.match(/sha256-/g)).toHaveLength(1)
    expect(policy).toContain("connect-src 'self' https://api.letshyre.ai")
  })

  it("puts the meta tag before any script", () => {
    const out = injectMetaPolicy(html, "default-src 'self'")
    expect(out.indexOf("Content-Security-Policy")).toBeLessThan(
      out.indexOf("<script")
    )
  })

  it("round-trips the nginx map", () => {
    const policies = new Map([["/en", "a 'b'"]])
    expect(parseNginxMap(nginxMap(policies, "c"))).toEqual({
      policies,
      fallback: "c",
    })
  })
})

it("collects preloaded and imported modules once", () => {
  expect(
    initialScriptsOf(
      `<link rel="modulepreload" href="/assets/a.js"/><script type="module">import "/assets/a.js";\nimport * as r from "/assets/b.js";</script>`
    )
  ).toEqual(["/assets/a.js", "/assets/b.js"])
})
