import type { Post } from "./post"

/** What the index sends for search: every post in the locale, without the parts only a post page needs. */
export type PostSummary = Omit<Post, "headings" | "metaTitle" | "sources">

export const summarize = ({
  headings: _headings,
  metaTitle: _metaTitle,
  sources: _sources,
  ...summary
}: Post): PostSummary => summary

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
