// usage: pnpm blog:og [slug…] (default: published posts without one); --no-build reuses the last build

import { existsSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { readPosts } from "../app/lib/blog/read-posts.ts"
import { BLOG_DIR } from "../app/lib/readiness.ts"
import { drawShareImages, shareImageOf } from "./share-images.ts"

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)))
const args = process.argv.slice(2)
const asked = args.filter((arg) => !arg.startsWith("--"))
const slugs = asked.length
  ? asked
  : [
      ...new Set(
        readPosts(join(ROOT, BLOG_DIR), false)
          .filter((post) => post.lang === "en")
          .map((post) => post.slug)
      ),
    ].filter((slug) => !existsSync(shareImageOf(slug)))

if (slugs.length === 0) console.log("every published post has an og.jpg")
else await drawShareImages(slugs, { build: !args.includes("--no-build") })
