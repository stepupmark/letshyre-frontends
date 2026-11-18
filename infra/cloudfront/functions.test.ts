// The edge functions, run in Node the way CloudFront runs them: one script, one global `handler`.
// usage: pnpm test:edge

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"

interface Header {
  value: string
}
interface Request {
  uri: string
  querystring: Record<string, { value: string; multiValue?: Header[] }>
  headers: Record<string, Header>
}
interface Response {
  statusCode: number
  headers: Record<string, Header>
}
type Handler = (event: {
  request: Request
  response?: Response
}) => Request | Response

const load = (file: string, host?: string): Handler => {
  let source = readFileSync(new URL(file, import.meta.url), "utf8")
  if (host)
    source = source.replace(/^var HOST = ".*"$/m, `var HOST = "${host}"`)
  return new Function(`${source}\nreturn handler`)() as Handler
}

const request = (
  uri: string,
  host = "beta.letshyre.ai",
  querystring: Request["querystring"] = {}
): Request => ({ uri, querystring, headers: { host: { value: host } } })

const location = (result: Request | Response) =>
  "statusCode" in result
    ? `${result.statusCode} ${result.headers.location?.value}`
    : `rewrite ${result.uri}`

describe("marketing-router", () => {
  const route = load("./marketing-router.js")
  const answer = (uri: string, host?: string) =>
    location(route({ request: request(uri, host) }))

  it("sends every other host to the canonical one, path and query kept", () => {
    const result = route({
      request: request("/en/pricing", "d123.cloudfront.net", {
        a: { value: "1" },
      }),
    })
    assert.equal(
      location(result),
      "301 https://beta.letshyre.ai/en/pricing?a=1"
    )
    assert.equal(
      answer("/en", "www.letshyre.ai"),
      "301 https://beta.letshyre.ai/en"
    )
  })

  it("normalises the root, index.html and trailing slashes", () => {
    assert.equal(answer("/"), "301 /en")
    assert.equal(answer("/index.html"), "301 /en")
    assert.equal(answer("/en/index.html"), "301 /en")
    assert.equal(answer("/en/pricing/index.html"), "301 /en/pricing")
    assert.equal(answer("/en/"), "301 /en")
    assert.equal(answer("/en/pricing/"), "301 /en/pricing")
  })

  it("keeps the query string on a redirect, repeated keys included", () => {
    const result = route({
      request: request("/", "beta.letshyre.ai", {
        utm_source: { value: "x" },
        tag: { value: "a", multiValue: [{ value: "a" }, { value: "b" }] },
        saved: { value: "" },
      }),
    })
    assert.equal(location(result), "301 /en?utm_source=x&tag=a&tag=b&saved")
  })

  it("marks its redirects as short-lived and HTTPS-only", () => {
    const result = route({ request: request("/") }) as Response
    assert.equal(result.headers["cache-control"]?.value, "max-age=86400")
    assert.match(
      result.headers["strict-transport-security"]?.value ?? "",
      /max-age=/
    )
  })

  it("serves locale pages from their index.html, up to four segments deep", () => {
    assert.equal(answer("/en"), "rewrite /en/index.html")
    assert.equal(answer("/ar"), "rewrite /ar/index.html")
    assert.equal(answer("/en/pricing"), "rewrite /en/pricing/index.html")
    assert.equal(
      answer("/en/blogs/glossary/ctc"),
      "rewrite /en/blogs/glossary/ctc/index.html"
    )
  })

  it("passes files through untouched", () => {
    for (const uri of [
      "/en.data",
      "/en/pricing.data",
      "/en/blogs/feed.xml",
      "/en/blogs/search.json",
      "/sitemap.xml",
      "/robots.txt",
      "/site.webmanifest",
      "/og/home.jpg",
      "/images/home/her-desk-960.avif",
    ]) {
      assert.equal(answer(uri), `rewrite ${uri}`, uri)
    }
  })

  it("leaves everything else to S3, which answers 404", () => {
    for (const uri of [
      "/xx/pricing",
      "/EN/pricing",
      "/en/Pricing",
      "/en/a/b/c/d",
      "/404",
      "/images/home/SOURCES.md",
    ]) {
      assert.equal(answer(uri), `rewrite ${uri}`, uri)
    }
  })
})

describe("spa-router", () => {
  const route = load("./spa-router.js", "adm.letshyre.ai")
  const answer = (uri: string, host = "adm.letshyre.ai") =>
    location(route({ request: request(uri, host) }))

  it("gives every route the shell, dots in parameters included", () => {
    assert.equal(answer("/"), "rewrite /index.html")
    assert.equal(answer("/employer/jobs/42"), "rewrite /index.html")
    assert.equal(answer("/shared-scorecard/abc.def"), "rewrite /index.html")
  })

  it("never answers a missing asset with the shell", () => {
    assert.equal(
      answer("/assets/gone-abc123.js"),
      "rewrite /assets/gone-abc123.js"
    )
    assert.equal(answer("/robots.txt"), "rewrite /robots.txt")
  })

  it("sends other hosts to its own", () => {
    assert.equal(
      answer("/kyc", "d456.cloudfront.net"),
      "301 https://adm.letshyre.ai/kyc"
    )
  })
})

describe("headers", () => {
  const respond = load("./headers.js")
  const run = (host: string, headers: Record<string, Header> = {}) =>
    (
      respond({
        request: request("/en", host),
        response: { statusCode: 200, headers },
      }) as Response
    ).headers

  it("turns the S3 metadata policy into a report-only header", () => {
    const headers = run("beta.letshyre.ai", {
      "x-amz-meta-csp": { value: "default-src 'self'" },
      "x-amz-meta-csp-mode": { value: "report-only" },
      "x-amz-version-id": { value: "v1" },
    })
    assert.equal(
      headers["content-security-policy-report-only"]?.value,
      "default-src 'self'; frame-ancestors 'none'"
    )
    assert.equal(headers["content-security-policy"], undefined)
    assert.deepEqual(
      Object.keys(headers).filter((name) => name.startsWith("x-amz-")),
      []
    )
  })

  it("enforces the policy when the deploy says so", () => {
    const headers = run("app.letshyre.ai", {
      "x-amz-meta-csp": { value: "default-src 'self'" },
      "x-amz-meta-csp-mode": { value: "enforce" },
    })
    assert.ok(headers["content-security-policy"])
    assert.equal(headers["content-security-policy-report-only"], undefined)
  })

  it("keeps beta, the app and admin out of search, and the apex in", () => {
    assert.equal(
      run("beta.letshyre.ai")["x-robots-tag"]?.value,
      "noindex, nofollow"
    )
    assert.equal(
      run("app.letshyre.ai")["x-robots-tag"]?.value,
      "noindex, nofollow"
    )
    assert.equal(
      run("adm.letshyre.ai")["x-robots-tag"]?.value,
      "noindex, nofollow"
    )
    assert.equal(run("letshyre.ai")["x-robots-tag"], undefined)
  })

  it("lets only the app use the camera and microphone", () => {
    assert.match(
      run("app.letshyre.ai")["permissions-policy"]?.value ?? "",
      /camera=\(self\)/
    )
    assert.match(
      run("letshyre.ai")["permissions-policy"]?.value ?? "",
      /camera=\(\)/
    )
  })
})
