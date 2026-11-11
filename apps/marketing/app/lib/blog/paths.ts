// Kept apart from post.ts so pages can link to posts without shipping the parser.

const BLOG = "/blogs"

export const postPath = (slug: string) => `${BLOG}/${slug}`
export const topicsPath = `${BLOG}/topics`
export const topicPath = (topic: string) => `${topicsPath}/${topic}`
export const tagPath = (tag: string) => `${BLOG}/tags/${tag}`
export const glossaryPath = `${BLOG}/glossary`
export const termPath = (id: string) => `${glossaryPath}/${id}`
export const feedPath = `${BLOG}/feed.xml`
export const searchIndexPath = `${BLOG}/search.json`
export const indexPagePath = (page: number) =>
  page === 1 ? BLOG : `${BLOG}/page/${page}`

const LIST_PATH = new RegExp(
  String.raw`^/[\w-]+(?:${BLOG}(?:/page/\d+)?|${BLOG}/(?:topics|tags)/[\w-]+)/?$`
)

/** The index, its later pages, and the topic and tag pages, under any locale. */
export const isListPath = (pathname: string) => LIST_PATH.test(pathname)
