import type { Post, PostSummary } from "./post"

export const summarize = (post: Post): PostSummary => ({
  slug: post.slug,
  title: post.title,
  description: post.description,
  topic: post.topic,
  publishedAt: post.publishedAt,
  updatedAt: post.updatedAt,
  minutes: post.minutes,
  draft: post.draft,
  cover: post.cover,
  preview: post.preview,
})

export const searchWords = (query: string, lang: string) =>
  query.toLocaleLowerCase(lang).split(/\s+/).filter(Boolean)

/** Posts whose title, description or topic name has every word of the query, in any order. */
export function searchPosts<
  T extends Pick<Post, "title" | "description" | "topic">,
>(
  posts: readonly T[],
  query: string,
  lang: string,
  topicName: (topic: T["topic"]) => string = () => ""
): T[] {
  const words = searchWords(query, lang)
  if (words.length === 0) return []
  return posts.filter((post) => {
    const text =
      `${post.title} ${post.description} ${topicName(post.topic)}`.toLocaleLowerCase(
        lang
      )
    return words.every((word) => text.includes(word))
  })
}
