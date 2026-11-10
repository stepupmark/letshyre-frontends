import { ArchivePage } from "@/features/blog"
import { archiveData } from "@/lib/page-data.server"
import { archiveMeta } from "@/lib/seo/blog-pages-meta"

import type { Route } from "./+types/_site.$lang.blogs.archive"

export const loader = ({ params }: Route.LoaderArgs) => archiveData(params.lang)

export const meta = archiveMeta

export default function BlogArchive({ loaderData }: Route.ComponentProps) {
  return <ArchivePage posts={loaderData.posts} />
}
