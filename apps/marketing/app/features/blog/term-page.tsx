import { useLocale, useTranslation } from "@workspace/i18n/react"

import { Container, PageHeader } from "@/components/section"
import type { Term } from "@/lib/blog/glossary"
import { glossaryPath } from "@/lib/blog/paths"
import type { PostSummary } from "@/lib/blog/post"

import { plainComponents } from "./components/mdx/plain"
import { BackLink } from "./components/back-link"
import { BlogCrumbs } from "./components/blog-crumbs"
import { PostCta } from "./components/post-cta"
import { PostGrid } from "./components/post-list"
import { useMdxBody } from "./hooks/use-post-body"

function TermBody({ term }: { term: Term }) {
  const Body = useMdxBody("glossary", term.lang, term.id)
  // eslint-disable-next-line react-hooks/static-components -- cached per term, so it never changes identity
  return <Body components={plainComponents} />
}

export function TermPage({
  term,
  posts,
}: {
  term: Term
  posts: readonly PostSummary[]
}) {
  const { t } = useTranslation("blog")
  const lang = useLocale()

  return (
    <>
      <PageHeader
        eyebrow={
          <BlogCrumbs
            trail={[{ label: t("glossary.title"), to: glossaryPath }]}
          />
        }
        title={term.term}
        description={term.short}
      >
        {term.aliases.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("glossary.aka", {
              names: new Intl.ListFormat(lang, { type: "disjunction" }).format(
                term.aliases
              ),
            })}
          </p>
        )}
      </PageHeader>
      <Container className="flex flex-col gap-12 py-10 sm:py-14">
        <article className="flex max-w-prose flex-col gap-5 text-base text-foreground/85 lg:text-lg/8">
          <TermBody term={term} />
        </article>
        {posts.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {t("glossary.mentionedIn")}
            </h2>
            <PostGrid posts={posts} />
          </section>
        )}
        <BackLink to={glossaryPath} label={t("glossary.all")} />
      </Container>
      <PostCta audience="everyone" />
    </>
  )
}
