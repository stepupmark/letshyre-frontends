import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { useId } from "react"
import { Link } from "react-router"

import { postPath } from "@/lib/blog/paths"
import type { PostSummary, Topic } from "@/lib/blog/post"

import { useMdxBody } from "../hooks/use-post-body"
import { plainComponents } from "./mdx/plain"

export interface TopicGuideData {
  title: string
  description: string
  reading: PostSummary[]
}

function GuideBody({ topic }: { topic: Topic }) {
  const lang = useLocale()
  const Body = useMdxBody("guides", lang, topic)
  // eslint-disable-next-line react-hooks/static-components -- cached per guide, so it never changes identity
  return <Body components={plainComponents} />
}

/** A topic page's opening guide: what the topic covers, and its posts in the order to read them. */
export function TopicGuide({
  topic,
  guide,
}: {
  topic: Topic
  guide: TopicGuideData
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const titleId = useId()
  const readingId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="grid gap-10 border-b pb-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14"
    >
      <div className="flex max-w-prose flex-col gap-5 text-base text-foreground/85 lg:text-lg/8">
        <h2
          id={titleId}
          className="text-2xl font-semibold tracking-tight text-balance text-foreground"
        >
          {guide.title}
        </h2>
        <GuideBody topic={topic} />
      </div>
      {guide.reading.length > 1 && (
        <nav
          aria-labelledby={readingId}
          className="flex flex-col gap-4 self-start rounded-xl border p-5 lg:sticky lg:top-24"
        >
          <h3
            id={readingId}
            className="text-sm font-medium text-muted-foreground"
          >
            {t("topicPage.readingOrder")}
          </h3>
          <ol className="flex flex-col gap-3">
            {guide.reading.map((post, i) => (
              <li key={post.slug} className="flex gap-3">
                <span
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded-full border text-xs font-medium tabular-nums"
                >
                  {i + 1}
                </span>
                <span className="flex flex-col gap-0.5">
                  <Link
                    to={localePath(lang, postPath(post.slug))}
                    prefetch="intent"
                    className="text-sm font-medium text-pretty hover:text-brand-text hover:underline"
                  >
                    {post.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {t("post.readTime", { count: post.minutes })}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </section>
  )
}
