import mdx from "@mdx-js/rollup"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"
import { imagetools } from "vite-imagetools"

import { mdxOptions } from "./app/lib/blog/mdx-options.ts"
import { parseEnv } from "./app/lib/env.schema.ts"

const compileMdx = mdx(mdxOptions)
const POST_ASSET = /[\\/]content[\\/]blog[\\/]/
const POST_PHOTO = /[\\/]content[\\/]blog[\\/].+\.(png|jpe?g|webp)$/

export default defineConfig(({ mode }) => {
  parseEnv(loadEnv(mode, import.meta.dirname, "VITE_"))

  return {
    resolve: { tsconfigPaths: true },
    // a post's images are fetched by the page; inlined, they'd ship in its HTML and its JS chunk too
    build: {
      assetsInlineLimit: (file: string) =>
        POST_ASSET.test(file) ? false : undefined,
    },
    plugins: [
      tailwindcss(),
      // a post photo imported without a query becomes AVIF and WebP srcsets for <Figure>
      imagetools({
        defaultDirectives: (url) =>
          POST_PHOTO.test(url.pathname) && url.searchParams.size === 0
            ? new URLSearchParams({
                w: "640;960;1440",
                format: "avif;webp;jpg",
                as: "picture",
              })
            : new URLSearchParams(),
      }),
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
