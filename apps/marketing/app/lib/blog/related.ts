import type { Post } from "./post.ts"

/** Every part of the post's series, first part first; empty when it stands alone. */
export function seriesOf(
  post: Post,
  posts: readonly Post[]
): Pick<Post, "slug" | "title">[] {
  if (!post.series) return []
  const parts = posts
    .filter((other) => other.series === post.series)
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
  return parts.length > 1
    ? parts.map(({ slug, title }) => ({ slug, title }))
    : []
}

/** Up to `limit` other posts: same topic first, then same audience, then newest. */
export function relatedPosts(
  post: Post,
  posts: readonly Post[],
  limit = 3
): Post[] {
  const score = (other: Post) =>
    (other.topic === post.topic ? 2 : 0) +
    (other.audience === post.audience ? 1 : 0)
  return posts
    .filter((other) => other.lang === post.lang && other.slug !== post.slug)
    .sort(
      (a, b) =>
        score(b) - score(a) || b.publishedAt.localeCompare(a.publishedAt)
    )
    .slice(0, limit)
}
