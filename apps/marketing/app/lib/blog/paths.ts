// Kept apart from post.ts so pages can link to posts without shipping the parser.

export const postPath = (slug: string) => `/blog/${slug}`
export const feedPath = "/blog/feed.xml"
