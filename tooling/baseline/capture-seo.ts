// usage: node tooling/baseline/capture-seo.ts [origin]

import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ORIGIN = (process.argv[2] ?? "https://letshyre.ai").replace(/\/$/, "")
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../docs/baseline/seo-baseline.json"
)
const CONCURRENCY = 6
const TIMEOUT_MS = 30_000

type Probe = { path: string; expect: string }

const PROBES: Probe[] = [
  { path: "/", expect: "root entry" },
  { path: "/en", expect: "locale home without trailing slash" },
  { path: "/en/", expect: "locale home with trailing slash" },
  { path: "/en/about", expect: "page without trailing slash" },
  { path: "/hi/pricing", expect: "page not translated in hi" },
  { path: "/hi/pricing/", expect: "page not translated in hi (slash)" },
  { path: "/xx/nonsense", expect: "unknown locale" },
  { path: "/en/does-not-exist", expect: "unknown page" },
  { path: "/employer", expect: "client route (employer)" },
  { path: "/employee", expect: "client route (employee)" },
  { path: "/get-started", expect: "client route (get-started)" },
  { path: "/shared-scorecard/abc", expect: "client route (shared scorecard)" },
  { path: "/robots.txt", expect: "robots" },
  { path: "/sitemap.xml", expect: "sitemap" },
  { path: "/assets/does-not-exist.js", expect: "missing asset" },
]

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .trim()

function tags(html: string, name: string): Record<string, string>[] {
  const out: Record<string, string>[] = []
  for (const m of html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))) {
    const attrs: Record<string, string> = {}
    for (const a of (m[1] ?? "").matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[a[1]!.toLowerCase()] = decode(a[2] ?? a[3] ?? "")
    }
    out.push(attrs)
  }
  return out
}

function jsonLdTypes(html: string) {
  const types: string[] = []
  let faqQuestions = 0
  for (const m of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      const node = JSON.parse(m[1] ?? "")
      for (const n of Array.isArray(node) ? node : [node]) {
        const t = Array.isArray(n["@type"]) ? n["@type"].join("+") : String(n["@type"])
        types.push(t)
        if (t === "FAQPage") faqQuestions += n.mainEntity?.length ?? 0
      }
    } catch {
      types.push("INVALID_JSON")
    }
  }
  return { types: types.sort(), faqQuestions }
}

function extract(html: string) {
  const metas = tags(html, "meta")
  const links = tags(html, "link")
  const htmlTag = tags(html, "html")[0] ?? {}
  const byName = (n: string) => metas.find((m) => m.name === n)?.content ?? null
  const prefixed = (p: string, key: "property" | "name") =>
    Object.fromEntries(
      metas
        .filter((m) => m[key]?.startsWith(p))
        .map((m) => [m[key]!, m.content ?? ""])
        .sort(([a], [b]) => a.localeCompare(b))
    )
  const hreflang = Object.fromEntries(
    links
      .filter((l) => l.rel === "alternate" && l.hreflang)
      .map((l) => [l.hreflang!, l.href ?? ""])
      .sort(([a], [b]) => a.localeCompare(b))
  )
  return {
    lang: htmlTag.lang ?? null,
    dir: htmlTag.dir ?? null,
    title: decode(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "") || null,
    description: byName("description"),
    robots: byName("robots"),
    canonical: links.find((l) => l.rel === "canonical")?.href ?? null,
    hreflang,
    og: prefixed("og:", "property"),
    twitter: prefixed("twitter:", "name"),
    jsonLd: jsonLdTypes(html),
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    bytes: Buffer.byteLength(html),
  }
}

async function get(url: string, redirect: RequestRedirect) {
  const res = await fetch(url, {
    redirect,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "LetsHyreBaselineCapture/1.0" },
  })
  return res
}

async function captureUrl(url: string) {
  const first = await get(url, "manual")
  const location = first.headers.get("location")
  const final = await get(url, "follow")
  const type = final.headers.get("content-type") ?? ""
  const html = type.includes("html") ? await final.text() : ""
  return {
    url,
    status: first.status,
    location,
    finalUrl: final.url,
    finalStatus: final.status,
    xRobotsTag: final.headers.get("x-robots-tag"),
    cacheControl: final.headers.get("cache-control"),
    ...(html ? extract(html) : { contentType: type }),
  }
}

async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      try {
        results[i] = await fn(items[i]!)
      } catch (error) {
        results[i] = { url: String(items[i]), error: String(error) } as R
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return results
}

const sitemapXml = await (await get(`${ORIGIN}/sitemap.xml`, "follow")).text()
const sitemap = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: decode(m[1]!.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? ""),
  lastmod: m[1]!.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
  alternates: [...m[1]!.matchAll(/hreflang="([^"]+)"/g)].map((a) => a[1]!).sort(),
}))

console.log(`capture-seo: ${sitemap.length} sitemap URLs, ${PROBES.length} probes on ${ORIGIN}`)

const pages = await pool(
  sitemap.map((s) => s.loc),
  captureUrl
)
const probes = await pool(PROBES, async (p) => ({
  ...p,
  ...(await captureUrl(`${ORIGIN}${p.path}`)),
}))

const failures = pages.filter(
  (p) => "error" in p || (p as { finalStatus?: number }).finalStatus !== 200
)

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(
  OUT,
  JSON.stringify(
    {
      origin: ORIGIN,
      capturedAt: new Date().toISOString(),
      counts: { sitemapUrls: sitemap.length, failures: failures.length },
      sitemap,
      pages,
      probes,
    },
    null,
    2
  ) + "\n"
)

console.log(`capture-seo: wrote ${OUT} (${failures.length} non-200 sitemap URLs)`)
