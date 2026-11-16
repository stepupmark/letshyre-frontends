import type { Config } from "@react-router/dev/config"
import { loadEnv } from "vite"

import { saveBlogBuild, startBlogBuild } from "./app/lib/blog/build.ts"
import { previewsOn } from "./app/lib/blog/list.ts"
import { readyPaths } from "./app/lib/readiness.ts"

const { VITE_ENV } = loadEnv("production", ".", "VITE_")

// one date and preview setting for the prerender list, the loaders and postbuild
const blog = startBlogBuild(
  previewsOn(VITE_ENV, process.env.NODE_ENV === "development")
)

export default {
  ssr: false,
  prerender: {
    // dev serves only these paths, so it lists drafts too, read fresh for a post added mid-session
    paths: () => [...readyPaths(".", blog.previews, blog.date), "/404"],
    concurrency: 4,
  },
  buildEnd: ({ reactRouterConfig }) => {
    saveBlogBuild(reactRouterConfig.buildDirectory)
  },
  subResourceIntegrity: true,
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
