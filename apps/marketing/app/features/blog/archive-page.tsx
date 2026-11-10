import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import { postPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { FeedLink } from "./components/feed-link"
import { PostCta } from "./components/post-cta"

type ArchivePost = Pick<Post, "slug" | "title" | "topic" | "publishedAt">

const monthOf = (post: ArchivePost) => post.publishedAt.slice(0, 7)

export function ArchivePage({ posts }: { posts: readonly ArchivePost[] }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const months = [...new Set(posts.map(monthOf))]
  const monthName = new Intl.DateTimeFormat(lang, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
  const day = new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })

  return (
    <>
      <PageHeader
        eyebrow={
          <Link
            to={localePath(lang, PAGES.blog.path)}
            className="hover:underline"
          >
            {t("index.eyebrow")}
          </Link>
        }
        title={t("archive.title")}
        description={t("archive.description")}
      >
        <FeedLink />
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <div className="flex max-w-3xl flex-col gap-10">
          {months.map((month) => (
            <section key={month} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {monthName.format(new Date(`${month}-01T00:00:00Z`))}
              </h2>
              <ol className="flex flex-col divide-y border-y">
                {posts
                  .filter((post) => monthOf(post) === month)
                  .map((post) => (
                    <li
                      key={post.slug}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                    >
                      <time
                        dateTime={post.publishedAt}
                        className="w-20 shrink-0 text-sm text-muted-foreground tabular-nums"
                      >
                        {day.format(new Date(`${post.publishedAt}T00:00:00Z`))}
                      </time>
                      <Link
                        to={localePath(lang, postPath(post.slug))}
                        prefetch="intent"
                        className="font-medium text-pretty hover:text-brand-text hover:underline"
                      >
                        {post.title}
                      </Link>
                      <span className="text-sm text-muted-foreground sm:ms-auto sm:shrink-0">
                        {t(`topics.${post.topic}`)}
                      </span>
                    </li>
                  ))}
              </ol>
            </section>
          ))}
        </div>
      </Container>
      <PostCta audience="everyone" />
    </>
  )
}
