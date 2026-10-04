import { createHash } from "node:crypto"

import { describe, expect, it } from "vitest"

import { injectMetaPolicy, nginxMap, pagePolicy, parseNginxMap } from "./csp"
import { initialScriptsOf } from "./html"
import { checkPage, width } from "./seo-checks"
import { renderRobots, renderSitemap } from "./sitemap"

const SITE = "https://letshyre.ai"

const page = (head: string, body = "<h1>Pricing</h1>") =>
  `<!DOCTYPE html><html><head><meta charSet="utf-8"/>${head}</head><body>${body}</body></html>`

const goodHead = [
  `<title>Pricing: Pay per Candidate Unlock | letshyre.ai</title>`,
  `<meta name="description" content="Start with free credits and buy more only when you need them, with no subscription at all."/>`,
  `<link rel="canonical" href="${SITE}/en/pricing"/>`,
  `<link rel="alternate" hrefLang="en" href="${SITE}/en/pricing"/>`,
  `<link rel="alternate" hrefLang="de" href="${SITE}/de/pricing"/>`,
  `<link rel="alternate" hrefLang="x-default" href="${SITE}/en/pricing"/>`,
  `<meta property="og:title" content="Pricing"/>`,
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
