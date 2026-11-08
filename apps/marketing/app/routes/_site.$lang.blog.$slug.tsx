import { loadPostBody, PostPage } from "@/features/blog"
import { postData } from "@/lib/page-data.server"
import { postMeta } from "@/lib/seo/post-meta"

import type { Route } from "./+types/_site.$lang.blog.$slug"

export async function loader({ params }: Route.LoaderArgs) {
  const data = postData(params.lang, params.slug)
  await loadPostBody(data.post.lang, data.post.slug)
  return data
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const [data] = await Promise.all([
    serverLoader(),
    loadPostBody(params.lang, params.slug),
  ])
  return data
}

export const meta = postMeta

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  return <PostPage post={loaderData.post} />
}
