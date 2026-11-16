import mdx from "@mdx-js/rollup"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"
import { imagetools } from "vite-imagetools"

import { startBlogBuild } from "./app/lib/blog/build.ts"
import { previewsOn } from "./app/lib/blog/list.ts"
import { mdxOptions } from "./app/lib/blog/mdx-options.ts"
import { parseEnv } from "./app/lib/env.schema.ts"

const compileMdx = mdx(mdxOptions)
const POST_ASSET = /[\\/]content[\\/]blog[\\/]/
const BLOG_BARREL = /[\\/]features[\\/]blog[\\/]index\.ts$/
const POST_PHOTO = /[\\/]content[\\/]blog[\\/].+\.(png|jpe?g|webp)$/

export default defineConfig(({ mode }) => {
  const env = parseEnv(loadEnv(mode, import.meta.dirname, "VITE_"))
  // react-router.config.ts has usually fixed these already; the first call wins
  const blog = startBlogBuild(previewsOn(env.VITE_ENV, mode === "development"))

  return {
    resolve: { tsconfigPaths: true },
    // a bare constant: on import.meta.env it would ride in the shared env object and change the
    // site chunk's hash on every build
    define: { __BLOG_BUILD_ID__: JSON.stringify(blog.id) },
    // files a post offers for download, imported beside it like its images
    assetsInclude: ["**/content/blog/**/*.{csv,docx,xlsx}"],
    // a post's images are fetched by the page; inlined, they'd ship in its HTML and its JS chunk too
    build: {
      assetsInlineLimit: (file: string) =>
        POST_ASSET.test(file) ? false : undefined,
      // lets each blog route take only its own page from the feature's barrel
      rolldownOptions: {
        treeshake: {
          moduleSideEffects: (id: string) => !BLOG_BARREL.test(id),
        },
      },
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
