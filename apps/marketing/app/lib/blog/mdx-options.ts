// Runs inside the MDX compiler (vite.config.ts), so no Vite-only imports.

import type { Options } from "@mdx-js/rollup"
import rehypeShiki from "@shikijs/rehype"
import rehypeSlug from "rehype-slug"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"

import { remarkGuard } from "./remark-guard.ts"

export const mdxOptions: Options = {
  remarkPlugins: [remarkFrontmatter, remarkGfm, remarkGuard],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeShiki,
      {
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
        langs: ["bash", "json", "yaml", "markdown", "ts", "tsx", "html", "css"],
        fallbackLanguage: "text",
      },
    ],
  ],
}
