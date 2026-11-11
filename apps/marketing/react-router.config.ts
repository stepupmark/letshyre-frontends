import type { Config } from "@react-router/dev/config"
import { loadEnv } from "vite"

import { previewsOn } from "./app/lib/blog/list.ts"
import { readyPaths } from "./app/lib/readiness.ts"

const { VITE_ENV } = loadEnv("production", ".", "VITE_")

export default {
  ssr: false,
  prerender: {
    // dev serves only these paths, so it lists drafts too, read fresh for a post added mid-session
    paths: () => [
      ...readyPaths(
        ".",
        previewsOn(VITE_ENV, process.env.NODE_ENV === "development")
      ),
      "/404",
    ],
    concurrency: 4,
  },
  subResourceIntegrity: true,
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
