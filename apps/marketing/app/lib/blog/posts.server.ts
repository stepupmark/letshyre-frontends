import { parsePost, type Post } from "./post"

const sources = import.meta.glob<string>("/content/blog/*/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
})

export const allPosts: Post[] = Object.entries(sources)
  .map(([file, source]) => parsePost(file, source))
  .filter((post) => import.meta.env.DEV || !post.draft)
