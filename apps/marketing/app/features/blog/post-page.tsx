import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowLeftIcon } from "lucide-react"
import { Link } from "react-router"

import { BackToTop } from "@/components/back-to-top"
import { ReadProgress } from "@/components/read-progress"
import { Container } from "@/components/section"
import { postPath } from "@/lib/blog/paths"
import type { Post } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"
import { absUrl } from "@/lib/seo/site"

import { mdxComponents } from "./components/mdx"
import { PostCta } from "./components/post-cta"
import { PostHeader } from "./components/post-header"
import { PostShare } from "./components/post-share"
import { PostToc } from "./components/post-toc"
import { RelatedPosts } from "./components/related-posts"
import { usePostBody } from "./hooks/use-post-body"

function PostBody({ post }: { post: Post }) {
  const Body = usePostBody(post.lang, post.slug)
  // eslint-disable-next-line react-hooks/static-components -- cached per post, so it never changes identity
  return <Body components={mdxComponents} />
}

export function PostPage({
  post,
  related,
}: {
  post: Post
  related: readonly Post[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

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
          <article className="flex flex-col gap-5 text-base text-foreground/85 *:max-w-prose *:data-wide:max-w-none lg:text-lg/8">
            <PostBody post={post} />
          </article>
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
        </div>
      </Container>
      <RelatedPosts posts={related} />
      <div className="print:hidden">
        <PostCta audience={post.audience} />
      </div>
    </div>
  )
}
