import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowLeftIcon } from "lucide-react"
import { lazy, Suspense, useEffect } from "react"
import { Link } from "react-router"

import { BackToTop } from "@/components/back-to-top"
import { ReadProgress } from "@/components/read-progress"
import { Container } from "@/components/section"
import { useHydrated } from "@/hooks/use-hydrated"
import { useLightPrint } from "@/hooks/use-light-print"
import { postPath, tagPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"
import { absUrl } from "@/lib/seo/site"

import { mdxComponents } from "./components/mdx"
import { PostCta } from "./components/post-cta"
import { PostHeader } from "./components/post-header"
import { PostNeighbours } from "./components/post-neighbours"
import { PostSeries } from "./components/post-series"
import { PostShare } from "./components/post-share"
import { PostSources } from "./components/post-sources"
import { PostToc } from "./components/post-toc"
import { RelatedPosts } from "./components/related-posts"
import { SaveButton } from "./components/save-button"
import { usePostBody } from "./hooks/use-post-body"
import { useReadingPosition } from "./hooks/use-reading-position"
import { inlineCtaHeading, InlineCtaSlot } from "./lib/cta"
import { POST_BODY_ID } from "./lib/post-body"
import { rememberAudience } from "./lib/reader"
import { SourcesContext } from "./lib/sources"
import { TermsContext } from "./lib/terms"

// only the browser can read aloud or select text, so neither ships in the page's first load
const ListenButton = lazy(() => import("./components/listen-button"))
const QuoteShare = lazy(() => import("./components/quote-share"))

type Terms = Readonly<Record<string, { term: string; short: string }>>

function PostBody({
  post,
  terms,
  before,
}: {
  post: Post
  terms: Terms
  before?: string
}) {
  const Body = usePostBody(post.lang, post.slug)
  return (
    <SourcesContext value={post.sources}>
      <TermsContext value={terms}>
        <InlineCtaSlot
          value={before ? { before, audience: post.audience } : undefined}
        >
          {/* eslint-disable-next-line react-hooks/static-components -- cached per post, so it never changes identity */}
          <Body components={mdxComponents} />
        </InlineCtaSlot>
      </TermsContext>
    </SourcesContext>
  )
}

export function PostPage({
  post,
  newer,
  older,
  series,
  related,
  terms,
}: {
  post: Post
  newer?: Post
  older?: Post
  series: readonly Pick<Post, "slug" | "title">[]
  related: readonly Post[]
  terms: Terms
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const ctaBefore = inlineCtaHeading(post)
  const url = absUrl(localePath(lang, postPath(post.slug)))
  const hydrated = useHydrated()
  useLightPrint()
  useReadingPosition(`${post.lang}/${post.slug}`)
  useEffect(() => {
    rememberAudience(post.audience)
  }, [post.audience])

  return (
    <div className="relative">
      <ReadProgress />
      <BackToTop label={t("post.backToTop")} />
      <PostHeader post={post} />
      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        {post.headings.length > 1 && (
          <div className="print:hidden">
            <PostToc headings={post.headings} />
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-12 lg:col-start-2">
          <div className="flex min-h-8 flex-wrap items-center gap-2 print:hidden">
            {hydrated && (
              <Suspense>
                <ListenButton key={post.slug} lang={post.lang} />
              </Suspense>
            )}
            <SaveButton slug={post.slug} />
          </div>
          <PostSeries slug={post.slug} parts={series} series={post.series} />
          <article
            id={POST_BODY_ID}
            className="flex flex-col gap-5 text-base text-foreground/85 *:max-w-prose *:data-wide:max-w-none lg:text-lg/8 print:text-foreground"
          >
            <PostBody post={post} terms={terms} before={ctaBefore} />
          </article>
          {hydrated && (
            <Suspense>
              <QuoteShare url={url} title={post.title} />
            </Suspense>
          )}
          <div className="max-w-prose">
            <PostSources sources={post.sources} />
          </div>
          {post.tags.length > 0 && (
            <div className="flex max-w-prose flex-wrap items-center gap-2 print:hidden">
              <p className="me-1 text-sm font-medium">{t("post.tags")}</p>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={localePath(lang, tagPath(tag))}
                  prefetch="intent"
                  className="rounded-full border px-3 py-1 text-sm transition-colors duration-200 hover:border-brand/40 hover:text-brand-text motion-reduce:transition-none"
                >
                  {t(`tags.${tag}`)}
                </Link>
              ))}
            </div>
          )}
          <footer className="flex max-w-prose flex-col items-start gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <PostShare url={url} title={post.title} />
            <Link
              to={localePath(lang, PAGES.blog.path)}
              className="text-link inline-flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeftIcon aria-hidden className="size-4 rtl:-scale-x-100" />
              {t("post.allPosts")}
            </Link>
          </footer>
          <PostNeighbours older={older} newer={newer} />
        </div>
      </Container>
      <RelatedPosts title={t("post.related")} posts={related} />
      {!ctaBefore && (
        <div className="print:hidden">
          <PostCta audience={post.audience} />
        </div>
      )}
    </div>
  )
}
