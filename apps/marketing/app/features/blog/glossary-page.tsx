import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import { termPath } from "@/lib/blog/paths"
import { PAGES } from "@/lib/pages"

import { BackLink } from "./components/back-link"
import { BlogCrumbs } from "./components/blog-crumbs"
import { PostCta } from "./components/post-cta"

export function GlossaryPage({
  terms,
}: {
  terms: readonly { id: string; term: string; short: string }[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <>
      <PageHeader
        eyebrow={<BlogCrumbs />}
        title={t("glossary.title")}
        description={t("glossary.description")}
      />
      <Container className="flex flex-col gap-8 py-8 sm:gap-10 sm:py-14">
        <dl className="grid gap-4 sm:grid-cols-2">
          {terms.map((term) => (
            <div
              key={term.id}
              className="relative flex flex-col gap-1.5 rounded-xl border p-5 transition-colors duration-200 focus-within:ring-3 focus-within:ring-ring/50 hover:border-brand/40 motion-reduce:transition-none"
            >
              <dt className="font-semibold">
                <Link
                  to={localePath(lang, termPath(term.id))}
                  prefetch="intent"
                  className="outline-none after:absolute after:inset-0"
                >
                  {term.term}
                </Link>
              </dt>
              <dd className="text-sm text-pretty text-muted-foreground">
                {term.short}
              </dd>
            </div>
          ))}
        </dl>
        <BackLink to={PAGES.blog.path} label={t("post.allPosts")} />
      </Container>
      <PostCta audience="everyone" />
    </>
  )
}
