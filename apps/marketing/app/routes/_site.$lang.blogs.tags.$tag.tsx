import { TagPage } from "@/features/blog"
import { tagData } from "@/lib/page-data.server"
import { tagMeta } from "@/lib/seo/blog-pages-meta"

import type { Route } from "./+types/_site.$lang.blogs.tags.$tag"

export const loader = ({ params }: Route.LoaderArgs) =>
  tagData(params.lang, params.tag)

export const meta = tagMeta

export default function BlogTag({ loaderData }: Route.ComponentProps) {
  return <TagPage tag={loaderData.tag} posts={loaderData.posts} />
}
