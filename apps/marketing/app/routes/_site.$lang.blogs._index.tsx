import { BlogIndexPage } from "@/features/blog"
import { readingFontPreload } from "@/lib/reading-font"
import { blogData } from "@/lib/page-data.server"
import { blogIndexMeta } from "@/lib/seo/blog-meta"

import type { Route } from "./+types/_site.$lang.blogs._index"

export const loader = ({ params }: Route.LoaderArgs) => blogData(params.lang)

export const meta = blogIndexMeta

export const links: Route.LinksFunction = () => [readingFontPreload]

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  return (
    <BlogIndexPage
      posts={loaderData.posts}
      page={loaderData.page}
      pages={loaderData.pages}
      topics={loaderData.topics}
      glossary={loaderData.glossary}
      lengths={loaderData.lengths}
    />
  )
}
