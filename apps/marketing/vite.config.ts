import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"

import { parseEnv } from "./app/lib/env.schema.ts"

export default defineConfig(({ mode }) => {
  parseEnv(loadEnv(mode, import.meta.dirname, "VITE_"))

  return {
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), reactRouter()],
  }
})
