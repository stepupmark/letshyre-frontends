import { loadBody, TopicPage } from "@/features/blog"
import { topicData } from "@/lib/page-data.server"
import { topicMeta } from "@/lib/seo/topic-meta"

import type { Route } from "./+types/_site.$lang.blogs.topics.$topic"

export async function loader({ params }: Route.LoaderArgs) {
  const data = topicData(params.lang, params.topic)
  if (data.guide) await loadBody("guides", params.lang, data.topic)
  return data
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const data = await serverLoader()
  if (data.guide) await loadBody("guides", params.lang, data.topic)
  return data
}

export const meta = topicMeta

export default function BlogTopic({ loaderData }: Route.ComponentProps) {
  return (
    <TopicPage
      topic={loaderData.topic}
      guide={loaderData.guide}
      posts={loaderData.posts}
      others={loaderData.others}
      topics={loaderData.topics}
    />
  )
}
