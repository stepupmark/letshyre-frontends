import { TopicPage } from "@/features/blog"
import { topicData } from "@/lib/page-data.server"
import { topicMeta } from "@/lib/seo/topic-meta"

import type { Route } from "./+types/_site.$lang.blogs.topics.$topic"

export const loader = ({ params }: Route.LoaderArgs) =>
  topicData(params.lang, params.topic)

export const meta = topicMeta

export default function BlogTopic({ loaderData }: Route.ComponentProps) {
  return (
    <TopicPage
      topic={loaderData.topic}
      posts={loaderData.posts}
      topics={loaderData.topics}
    />
  )
}
