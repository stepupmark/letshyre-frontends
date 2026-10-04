import type { Config } from "@react-router/dev/config"

import { readyPaths } from "./app/lib/readiness.ts"

export default {
  ssr: false,
  prerender: {
    paths: () => [...readyPaths("app/locales"), "/404"],
    concurrency: 4,
  },
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
