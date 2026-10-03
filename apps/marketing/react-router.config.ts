import type { Config } from "@react-router/dev/config"

import { readyPaths } from "./app/lib/readiness.ts"

export default {
  ssr: false,
  prerender: {
    paths: () => [...readyPaths("app/locales"), "/404"],
    // parallel prerender requests drop sockets intermittently on Windows
    concurrency: process.platform === "win32" ? 1 : 4,
  },
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
