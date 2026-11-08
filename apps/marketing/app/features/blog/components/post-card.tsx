import { localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { Link } from "react-router"

import { type Post, postPath } from "@/lib/blog/post"

import { PostFacts } from "./post-facts"

export function PostCard({ post }: { post: Post }) {
  const lang = useLocale()

  return (
    <article className="relative flex flex-col gap-3 rounded-xl border p-6 transition-colors duration-200 focus-within:ring-3 focus-within:ring-ring/50 hover:bg-muted/40 motion-reduce:transition-none">
      <h2 className="text-xl font-semibold tracking-tight text-balance">
        <Link
          to={localePath(lang, postPath(post.slug))}
          className="outline-none after:absolute after:inset-0"
        >
          {post.title}
        </Link>
      </h2>
      <p className="text-pretty text-muted-foreground">{post.description}</p>
      <PostFacts post={post} />
    </article>
  )
}
