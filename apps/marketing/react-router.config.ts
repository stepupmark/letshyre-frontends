import type { Config } from "@react-router/dev/config"
import { loadEnv } from "vite"

import { readyPaths } from "./app/lib/readiness.ts"

const previews = loadEnv("production", ".", "VITE_").VITE_ENV === "staging"

export default {
  ssr: false,
  prerender: {
    // dev serves only these paths, so it lists drafts too, read fresh for a post added mid-session
    paths: () => [
      ...readyPaths(".", previews || process.env.NODE_ENV === "development"),
      "/404",
    ],
    concurrency: 4,
  },
  subResourceIntegrity: true,
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
