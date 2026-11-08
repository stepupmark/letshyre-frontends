import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { PageHeader } from "@/components/section"
import { AUTHORS } from "@/lib/blog/authors"
import type { Post } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { PostFacts } from "./post-facts"

export function PostHeader({ post }: { post: Post }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const author = post.author ? AUTHORS[post.author] : undefined

  return (
    <PageHeader
      eyebrow={
        <>
          <Link
            to={localePath(lang, PAGES.blog.path)}
            className="hover:underline"
          >
            {t("index.eyebrow")}
          </Link>
          <span aria-hidden className="mx-2 text-muted-foreground">
            /
          </span>
          <span className="text-muted-foreground">
            {t(`topics.${post.topic}`)}
          </span>
        </>
      }
      title={post.title}
      description={post.description}
    >
      <div className="flex flex-col gap-2">
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
    </PageHeader>
  )
}
