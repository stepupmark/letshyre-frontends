// Node only. The prerender list and the route loaders run in the build's process, postbuild in its
// own; they must agree on what ships, so the date and preview setting are fixed once per build.

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

interface BlogBuild {
  /** The UTC day this build treats as today. */
  date: string
  /** Changes every build, so a cached search index is never the previous build's. */
  id: string
  previews: boolean
}

const FILE = "blog-build.json"
const env = process.env

/** Fixes the build's date, id and preview setting; the first call wins. */
export function startBlogBuild(previews: boolean): BlogBuild {
  env.BLOG_BUILD_DATE ??= new Date().toISOString().slice(0, 10)
  env.BLOG_BUILD_ID ??= Date.now().toString(36)
  env.BLOG_PREVIEWS ??= previews ? "1" : "0"
  return blogBuild()
}

export const blogBuild = (): BlogBuild => ({
  date: env.BLOG_BUILD_DATE ?? new Date().toISOString().slice(0, 10),
  id: env.BLOG_BUILD_ID ?? "",
  previews: env.BLOG_PREVIEWS === "1",
})

/** Leaves the build's settings beside its output, for postbuild. */
export const saveBlogBuild = (buildDir: string) => {
  writeFileSync(join(buildDir, FILE), JSON.stringify(blogBuild()))
}

/** Postbuild: takes on the settings the build used, if it left them. */
export function resumeBlogBuild(
  buildDir: string,
  previews: boolean
): BlogBuild {
  const file = join(buildDir, FILE)
  if (existsSync(file)) {
    const saved = JSON.parse(readFileSync(file, "utf8")) as Partial<BlogBuild>
    if (saved.date) env.BLOG_BUILD_DATE = saved.date
    if (saved.id) env.BLOG_BUILD_ID = saved.id
    if (saved.previews !== undefined)
      env.BLOG_PREVIEWS = saved.previews ? "1" : "0"
  }
  return startBlogBuild(previews)
}
