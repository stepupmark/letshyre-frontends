import type { Config } from "@react-router/dev/config"

import { readyPaths } from "./app/lib/readiness.ts"

export default {
  ssr: false,
  prerender: {
    paths: () => [...readyPaths("."), "/404"],
    concurrency: 4,
  },
  subResourceIntegrity: true,
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
