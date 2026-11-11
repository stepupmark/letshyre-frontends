import { LogoMark } from "@workspace/blocks/logo"
import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"
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

export function PostHeader({ post }: { post: Post }) {
  const { t } = useTranslation("blog")
  const author = post.author ? AUTHORS[post.author] : undefined

  return (
    <PageHeader
      eyebrow={
        <BlogCrumbs
          trail={[
            { label: t(`topics.${post.topic}`), to: topicPath(post.topic) },
          ]}
        />
      }
      title={post.title}
      description={post.description}
      art={
        post.cover && <PostCover post={post} className="rounded-xl border" />
      }
    >
      <div className="flex items-center gap-3">
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
          <LogoMark label="" className="size-10 rounded-full border" />
        )}
        <div className="flex flex-col gap-0.5">
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
    </PageHeader>
  )
}
