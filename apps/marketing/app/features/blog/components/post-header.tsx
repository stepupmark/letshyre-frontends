import { LogoMark } from "@workspace/blocks/logo"
import { useTranslation } from "@workspace/i18n/react"
import type { ReactNode } from "react"

import { Container } from "@/components/section"
import { AUTHORS } from "@/lib/blog/authors"
import { topicPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"

import { BlogCrumbs } from "./blog-crumbs"
import { PostCover } from "./post-cover"
import { PostFacts } from "./post-facts"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

function Byline({ post }: { post: Post }) {
  const { t } = useTranslation("blog")
  const author = post.author ? AUTHORS[post.author] : undefined

  return (
    <div className="flex min-w-0 items-center gap-3">
      {author ? (
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted text-sm font-medium text-muted-foreground"
        >
          {author.photo ? (
            <img
              src={author.photo}
              alt=""
              width={80}
              height={80}
              className="size-full object-cover"
            />
          ) : (
            initials(author.name)
          )}
        </span>
      ) : (
        <LogoMark label="" className="size-10 shrink-0 rounded-full border" />
      )}
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm font-medium">
          {author ? (
            <a href={author.url} rel="author" className="hover:underline">
              {t("post.by", { name: author.name, role: author.jobTitle })}
            </a>
          ) : (
            t("post.byTeam")
          )}
        </p>
        <PostFacts post={post} />
      </div>
    </div>
  )
}

export function PostHeader({
  post,
  actions,
}: {
  post: Post
  actions?: ReactNode
}) {
  const { t } = useTranslation("blog")

  return (
    <header className="border-b">
      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:gap-20">
        <div className="flex max-w-2xl flex-col gap-5">
          <p className="text-sm font-semibold text-primary">
            <BlogCrumbs
              trail={[
                { label: t(`topics.${post.topic}`), to: topicPath(post.topic) },
              ]}
            />
          </p>
          <h1 className="text-4xl/[1.1] font-semibold tracking-tight text-balance sm:text-5xl/[1.05]">
            {post.title}
          </h1>
          <p className="text-lg/7 text-pretty text-muted-foreground sm:text-xl/8">
            {post.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t pt-6">
            <Byline post={post} />
            {actions && (
              <div className="flex min-h-8 flex-wrap items-center gap-2 print:hidden">
                {actions}
              </div>
            )}
          </div>
        </div>
        {post.cover && (
          <PostCover
            post={post}
            className="max-w-2xl rounded-2xl border max-sm:hidden lg:max-w-none"
          />
        )}
      </Container>
    </header>
  )
}
