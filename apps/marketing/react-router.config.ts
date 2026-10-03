import type { Config } from "@react-router/dev/config"

export default {
  ssr: false,
  prerender: { paths: ["/en"], concurrency: 4 },
  // no server to answer /__manifest on static hosting
  routeDiscovery: { mode: "initial" },
} satisfies Config
