import { TagPage } from "@/features/blog"
import { readingFontPreload } from "@/lib/reading-font"
import { tagData } from "@/lib/page-data.server"
import { tagMeta } from "@/lib/seo/blog-pages-meta"

import type { Route } from "./+types/_site.$lang.blogs.tags.$tag"

export const loader = ({ params }: Route.LoaderArgs) =>
  tagData(params.lang, params.tag)

export const meta = tagMeta

export const links: Route.LinksFunction = () => [readingFontPreload]

export default function BlogTag({ loaderData }: Route.ComponentProps) {
  return <TagPage tag={loaderData.tag} posts={loaderData.posts} />
}
