import { parsePosts, type Post } from "./post"

const sources = import.meta.glob<string>("/content/blog/*/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
})

const ogImages = import.meta.glob<string>("/content/blog/*/og.jpg", {
  eager: true,
  query: "?url",
  import: "default",
})

const covers = import.meta.glob<string>("/content/blog/*/cover*.svg", {
  eager: true,
  query: "?url",
  import: "default",
})

function withCover(post: Post): Post {
  const src = covers[`/content/blog/${post.slug}/cover.svg`]
  if (!src) return post
  const srcDark = covers[`/content/blog/${post.slug}/cover-dark.svg`]
  return { ...post, cover: srcDark ? { src, srcDark } : { src } }
}

export const allPosts: Post[] = parsePosts(
  Object.entries(sources),
  import.meta.env.DEV || import.meta.env.VITE_ENV === "staging"
).map(withCover)

/** A post's own share image, `<slug>/og.jpg`, if it has one. */
export const ogImageOf = (slug: string): string | undefined =>
  ogImages[`/content/blog/${slug}/og.jpg`]
