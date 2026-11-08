import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowLeftIcon } from "lucide-react"
import { Suspense } from "react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import type { Post } from "@/lib/blog/post"
import { PAGES } from "@/lib/pages"

import { mdxComponents } from "./components/mdx"
import { PostFacts } from "./components/post-facts"
import { usePostBody } from "./hooks/use-post-body"

function PostBody({ post }: { post: Post }) {
  const Body = usePostBody(post.lang, post.slug)
  // eslint-disable-next-line react-hooks/static-components -- cached per post, so it never changes identity
  return <Body components={mdxComponents} />
}

export function PostPage({ post }: { post: Post }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const blogPath = localePath(lang, PAGES.blog.path)

  return (
    <>
      <PageHeader
        eyebrow={
          <Link to={blogPath} className="hover:underline">
            {t("index.eyebrow")}
          </Link>
        }
        title={post.title}
        description={post.description}
      >
        <PostFacts post={post} />
      </PageHeader>
      <Container className="py-10 sm:py-14">
        <article className="flex max-w-[65ch] flex-col gap-5 text-base/7 text-foreground/85">
          <Suspense>
            <PostBody post={post} />
          </Suspense>
        </article>
        <Link
          to={blogPath}
          className="text-link mt-12 inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeftIcon aria-hidden className="size-4 rtl:-scale-x-100" />
          {t("post.allPosts")}
        </Link>
      </Container>
    </>
  )
}
