import { parsePost, type Post, visiblePosts } from "./post"

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

export const allPosts: Post[] = visiblePosts(
  Object.entries(sources).map(([file, source]) => parsePost(file, source)),
  import.meta.env.DEV || import.meta.env.VITE_ENV === "staging"
)

/** A post's own share image, `<slug>/og.jpg`, if it has one. */
export const ogImageOf = (slug: string): string | undefined =>
  ogImages[`/content/blog/${slug}/og.jpg`]
