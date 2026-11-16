import { loadPostBody, PostPage } from "@/features/blog"
import { postData } from "@/lib/page-data.server"
import { postMeta } from "@/lib/seo/post-meta"

import type { Route } from "./+types/_site.$lang.blogs.$slug"

export async function loader({ params }: Route.LoaderArgs) {
  const data = postData(params.lang, params.slug)
  await loadPostBody(data.post.lang, data.post.slug)
  return data
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  // fetched alongside the data, but the data goes first so an unknown slug is a 404, not an error
  const body = loadPostBody(params.lang, params.slug)
  void body.catch(() => undefined)
  const data = await serverLoader()
  await body
  return data
}

export const meta = postMeta

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  return (
    <PostPage
      post={loaderData.post}
      newer={loaderData.newer}
      older={loaderData.older}
      related={loaderData.related}
      series={loaderData.series}
      tags={loaderData.tags}
      terms={loaderData.terms}
    />
  )
}
