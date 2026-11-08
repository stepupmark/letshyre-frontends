import type { Config } from "@react-router/dev/config"
import { loadEnv } from "vite"

import { readyPaths } from "./app/lib/readiness.ts"

const previews = loadEnv("production", ".", "VITE_").VITE_ENV === "staging"

export default {
  ssr: false,
  prerender: {
    paths: () => [...readyPaths(".", previews), "/404"],
    concurrency: 4,
  },
  subResourceIntegrity: true,
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
