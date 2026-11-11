import { execSync, spawn } from "node:child_process"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "@playwright/test"

import { BLOG_DIR } from "../app/lib/readiness.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const PORT = 4179
const BASE = `http://127.0.0.1:${PORT}`
// the size buildMeta announces for every share image
const SIZE = { width: 1024, height: 535 }

export const shareImageOf = (slug: string) =>
  join(ROOT, BLOG_DIR, slug, "og.jpg")

/**
 * Draws each post's `og.jpg` from its English page header, the way the images in public/og were
 * made. The build is a staging one so drafts and scheduled posts have a page to draw.
 */
export async function drawShareImages(
  slugs: readonly string[],
  { build = true }: { build?: boolean } = {}
) {
  if (build)
    execSync("pnpm build", {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, VITE_ENV: "staging" },
    })
  const server = spawn(process.execPath, ["e2e/serve.ts", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
  })
  try {
    for (let tries = 0; ; tries++) {
      const up = await fetch(BASE).then(
        () => true,
        () => false
      )
      if (up) break
      if (tries === 50) throw new Error("the preview server didn't start")
      await new Promise((done) => setTimeout(done, 200))
    }

    const browser = await chromium.launch()
    // without scripts the prerendered page is all there is: no consent banner, no read progress
    const page = await browser.newPage({
      viewport: SIZE,
      colorScheme: "light",
      javaScriptEnabled: false,
    })
    // the header alone, without the draft or scheduled badge a staging build adds
    await page.route("**/en/blogs/*", async (route) => {
      const response = await route.fetch()
      const html = (await response.text()).replace(
        "</head>",
        "<style>header:not(main header),main header~*{visibility:hidden}main header{border:0}[data-slot=badge]{display:none}</style></head>"
      )
      await route.fulfill({ response, body: html })
    })
    for (const slug of slugs) {
      await page.goto(`${BASE}/en/blogs/${slug}`)
      const box = await page.locator("main header").first().boundingBox()
      if (!box) throw new Error(`${slug}: no page header`)
      await page.screenshot({
        path: shareImageOf(slug),
        type: "jpeg",
        quality: 85,
        fullPage: true,
        clip: {
          x: 0,
          y: Math.max(0, box.y - (SIZE.height - box.height) / 2),
          ...SIZE,
        },
      })
      console.log(`share image: ${slug}/og.jpg`)
    }
    await browser.close()
  } finally {
    server.kill()
  }
}
