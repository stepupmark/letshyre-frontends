import type { Post } from "./post"

/** What the index sends for search: every post in the locale, without the parts only a post page needs. */
export type PostSummary = Omit<Post, "headings" | "metaTitle">

export const summarize = ({
  headings: _headings,
  metaTitle: _metaTitle,
  ...summary
}: Post): PostSummary => summary

/** Posts whose title or description has every word of the query, in any order. */
export function searchPosts<T extends Pick<Post, "title" | "description">>(
  posts: readonly T[],
  query: string,
  lang: string
): T[] {
  const words = query.toLocaleLowerCase(lang).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return posts.filter((post) => {
    const text = `${post.title} ${post.description}`.toLocaleLowerCase(lang)
    return words.every((word) => text.includes(word))
  })
}
