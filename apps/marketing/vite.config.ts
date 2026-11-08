import mdx from "@mdx-js/rollup"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import { defineConfig, loadEnv } from "vite"

import { remarkGuard } from "./app/lib/blog/remark-guard.ts"
import { parseEnv } from "./app/lib/env.schema.ts"

const compileMdx = mdx({
  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkGuard],
})

export default defineConfig(({ mode }) => {
  parseEnv(loadEnv(mode, import.meta.dirname, "VITE_"))

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      tailwindcss(),
      {
        ...compileMdx,
        enforce: "pre",
        // the plugin drops the query, so it would compile `?raw` frontmatter reads too
        transform(code, id) {
          return id.endsWith("?raw")
            ? undefined
            : compileMdx.transform.call(this, code, id)
        },
      },
      reactRouter(),
    ],
    // prerender fetches from here; "localhost" races ::1 and times out on Windows
    preview: { host: "127.0.0.1" },
  }
})
