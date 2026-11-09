// Draws each post's share image, content/blog/<slug>/og.jpg, from its English page header, the
// way the other pages' images in public/og were made. Needs a build served by `pnpm preview`.
// usage: node scripts/blog-og.ts [slug…] (default: posts without one)

import { existsSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "@playwright/test"

import { readPosts } from "../app/lib/blog/read-posts.ts"
import { BLOG_DIR } from "../app/lib/readiness.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173"
// the size buildMeta announces for every share image
const SIZE = { width: 1024, height: 535 }

const imageOf = (slug: string) => join(ROOT, BLOG_DIR, slug, "og.jpg")
const asked = process.argv.slice(2)
const slugs = asked.length
  ? asked
  : [
      ...new Set(
        readPosts(join(ROOT, BLOG_DIR), true)
          .filter((post) => post.lang === "en")
          .map((post) => post.slug)
      ),
    ].filter((slug) => !existsSync(imageOf(slug)))

const browser = await chromium.launch()
// without scripts the prerendered page is all there is: no consent banner, no read progress
const page = await browser.newPage({
  viewport: SIZE,
  colorScheme: "light",
  javaScriptEnabled: false,
})
// the image is the header alone, like the other pages'; scripts are off, so restyle the HTML
await page.route("**/en/blogs/*", async (route) => {
  const response = await route.fetch()
  const html = (await response.text()).replace(
    "</head>",
    "<style>header:not(main header),main header~*{visibility:hidden}main header{border:0}</style></head>"
  )
  await route.fulfill({ response, body: html })
})
for (const slug of slugs) {
  await page.goto(`${BASE}/en/blogs/${slug}`)
  const box = await page.locator("main header").first().boundingBox()
  if (!box) throw new Error(`${slug}: no page header`)
  await page.screenshot({
    path: imageOf(slug),
    type: "jpeg",
    quality: 85,
    fullPage: true,
    clip: {
      x: 0,
      y: Math.max(0, box.y - (SIZE.height - box.height) / 2),
      ...SIZE,
    },
  })
  console.log(`blog-og: ${slug}/og.jpg`)
}
await browser.close()
