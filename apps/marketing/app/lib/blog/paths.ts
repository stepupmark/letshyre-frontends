// Kept apart from post.ts so pages can link to posts without shipping the parser.

export const postPath = (slug: string) => `/blogs/${slug}`
export const topicPath = (topic: string) => `/blogs/topics/${topic}`
export const feedPath = "/blogs/feed.xml"
