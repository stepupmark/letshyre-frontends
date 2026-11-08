import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { RssIcon } from "lucide-react"
import { useId } from "react"

import { Container, PageHeader } from "@/components/section"
import { feedPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"

import { PostLead } from "./components/post-lead"
import { PostRow } from "./components/post-row"

export function BlogIndexPage({ posts }: { posts: Post[] }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const moreId = useId()
  const [lead, ...rest] = posts

  return (
    <>
      <PageHeader
        eyebrow={t("index.eyebrow")}
        title={t("index.title")}
        description={t("index.description")}
      >
        <a
          href={localePath(lang, feedPath)}
          type="application/rss+xml"
          className="text-link inline-flex items-center gap-2 text-sm font-medium"
        >
          <RssIcon aria-hidden className="size-4" />
          {t("index.feed")}
        </a>
      </PageHeader>
      <Container className="flex flex-col gap-12 py-10 sm:py-14">
        {lead && <PostLead post={lead} />}
        {rest.length > 0 && (
          <section aria-labelledby={moreId} className="flex flex-col gap-2">
            <h2 id={moreId} className="text-xl font-semibold tracking-tight">
              {t("index.more")}
            </h2>
            <ol className="divide-y border-y">
              {rest.map((post) => (
                <li key={post.slug}>
                  <PostRow post={post} />
                </li>
              ))}
            </ol>
          </section>
        )}
      </Container>
    </>
  )
}
