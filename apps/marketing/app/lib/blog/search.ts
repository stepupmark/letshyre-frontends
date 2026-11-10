import { type Length, lengthOf } from "./list"
import type { Post, PostSummary } from "./post"

export const summarize = (post: Post): PostSummary => ({
  slug: post.slug,
  title: post.title,
  description: post.description,
  topic: post.topic,
  tags: post.tags,
  publishedAt: post.publishedAt,
  updatedAt: post.updatedAt,
  minutes: post.minutes,
  draft: post.draft,
  cover: post.cover,
  preview: post.preview,
})

export const searchWords = (query: string, lang: string) =>
  query.toLocaleLowerCase(lang).split(/\s+/).filter(Boolean)

/**
 * Posts whose title, description or topic name has every word of the query, in any order, and of
 * the given length. With neither, nothing.
 */
export function searchPosts<
  T extends Pick<Post, "title" | "description" | "topic" | "minutes">,
>(
  posts: readonly T[],
  query: string,
  lang: string,
  topicName: (topic: T["topic"]) => string = () => "",
  length?: Length
): T[] {
  const words = searchWords(query, lang)
  if (words.length === 0 && !length) return []
  return posts.filter((post) => {
    if (length && lengthOf(post.minutes) !== length) return false
    const text =
      `${post.title} ${post.description} ${topicName(post.topic)}`.toLocaleLowerCase(
        lang
      )
    return words.every((word) => text.includes(word))
  })
}
