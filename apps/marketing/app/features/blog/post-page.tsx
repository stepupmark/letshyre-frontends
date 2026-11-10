import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowLeftIcon } from "lucide-react"
import { lazy, type ReactNode, Suspense, useRef } from "react"
import { Link } from "react-router"

import { BackToTop } from "@/components/back-to-top"
import { ReadProgress } from "@/components/read-progress"
import { Container } from "@/components/section"
import { useHydrated } from "@/hooks/use-hydrated"
import { useLightPrint } from "@/hooks/use-light-print"
import { postPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"
import { absUrl } from "@/lib/seo/site"

import { mdxComponents } from "./components/mdx"
import { PostCta } from "./components/post-cta"
import { PostHeader } from "./components/post-header"
import { PostNeighbours } from "./components/post-neighbours"
import { PostShare } from "./components/post-share"
import { PostSources } from "./components/post-sources"
import { PostToc } from "./components/post-toc"
import { RelatedPosts } from "./components/related-posts"
import { usePostBody } from "./hooks/use-post-body"
import { inlineCtaHeading, InlineCtaSlot } from "./lib/cta"
import { SourcesContext } from "./lib/sources"

// nothing to show until the reader scrolls, so it loads after hydration
const TimeLeft = lazy(() => import("./components/time-left"))

function PostBody({ post }: { post: Post }) {
  const Body = usePostBody(post.lang, post.slug)
  const before = inlineCtaHeading(post)
  return (
    <SourcesContext value={post.sources}>
      <InlineCtaSlot
        value={before ? { before, audience: post.audience } : undefined}
      >
        {/* eslint-disable-next-line react-hooks/static-components -- cached per post, so it never changes identity */}
        <Body components={mdxComponents} />
      </InlineCtaSlot>
    </SourcesContext>
  )
}

export function PostPage({
  post,
  newer,
  older,
  related,
  subscribe,
}: {
  post: Post
  newer?: Post
  older?: Post
  related: readonly Post[]
  /** The newsletter form, passed in by the route: features don't import each other. */
  subscribe: ReactNode
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const article = useRef<HTMLElement>(null)
  const hydrated = useHydrated()
  useLightPrint()

  return (
    <div className="relative">
      <ReadProgress />
      <BackToTop label={t("post.backToTop")} />
      {hydrated && (
        <Suspense>
          <TimeLeft article={article} minutes={post.minutes} />
        </Suspense>
      )}
      <PostHeader post={post} />
      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        {post.headings.length > 1 && (
          <div className="print:hidden">
            <PostToc headings={post.headings} />
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-12 lg:col-start-2">
          <article
            ref={article}
            className="flex flex-col gap-5 text-base text-foreground/85 *:max-w-prose *:data-wide:max-w-none lg:text-lg/8 print:text-foreground"
          >
            <PostBody post={post} />
          </article>
          <div className="max-w-prose">
            <PostSources sources={post.sources} />
          </div>
          <footer className="flex max-w-prose flex-col items-start gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <PostShare
              url={absUrl(localePath(lang, postPath(post.slug)))}
              title={post.title}
            />
            <Link
              to={localePath(lang, PAGES.blog.path)}
              className="text-link inline-flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeftIcon aria-hidden className="size-4 rtl:-scale-x-100" />
              {t("post.allPosts")}
            </Link>
          </footer>
          <div className="max-w-prose print:hidden">{subscribe}</div>
          <PostNeighbours older={older} newer={newer} />
        </div>
      </Container>
      <RelatedPosts title={t("post.related")} posts={related} />
      <div className="print:hidden">
        <PostCta audience={post.audience} />
      </div>
    </div>
  )
}
