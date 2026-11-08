// Tells IndexNow search engines (Bing, Yandex, Seznam…) which pages changed. Run after a
// production deploy, with the INDEXNOW_KEY the build was made with.
// usage: INDEXNOW_KEY=… node scripts/indexnow.ts [since YYYY-MM-DD, default today]

import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const key = process.env.INDEXNOW_KEY
const since = process.argv[2] ?? new Date().toISOString().slice(0, 10)
if (!key) throw new Error("INDEXNOW_KEY is not set")

const sitemap = readFileSync(join(ROOT, "build/client/sitemap.xml"), "utf8")
const urls = [
  ...sitemap.matchAll(
    /<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>/g
  ),
]
  .filter(([, , lastmod = ""]) => lastmod >= since)
  .map(([, loc = ""]) => loc)

if (!urls.length) {
  console.log(`indexnow: nothing changed since ${since}`)
  process.exit(0)
}

const host = new URL(urls[0] ?? "").host
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls.slice(0, 10_000),
  }),
})
if (!response.ok) {
  throw new Error(`indexnow: ${response.status} ${await response.text()}`)
}
console.log(`indexnow: sent ${urls.length} url(s) changed since ${since}`)
