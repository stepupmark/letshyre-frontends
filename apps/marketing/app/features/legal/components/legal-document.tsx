import { localePath } from "@workspace/i18n"
import {
  Trans,
  useFormat,
  useLocale,
  useTranslation,
} from "@workspace/i18n/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { useId, useMemo } from "react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"

import { useActiveSection } from "../hooks/use-active-section"
import {
  buildToc,
  LEGAL_DOCS,
  legalDocSchema,
  type LegalNamespace,
  readingMinutes,
} from "../lib/legal-doc"
import { LegalBlocks } from "./legal-blocks"
import { LegalToc } from "./legal-toc"

export function LegalDocument({
  ns,
  path,
}: {
  ns: LegalNamespace
  path: string
}) {
  const { t, i18n } = useTranslation(ns)
  const lang = useLocale()
  const format = useFormat()
  const tocId = useId()
  const { key, updated } = LEGAL_DOCS[ns]
  const doc = useMemo(
    () =>
      legalDocSchema.parse(
        i18n.getResource(i18n.language, ns, key) ??
          i18n.getResource("en", ns, key)
      ),
    [i18n, ns, key]
  )
  const toc = useMemo(() => buildToc(doc), [doc])
  const active = useActiveSection(toc.map((entry) => entry.id))

  return (
    <>
      <PageHeader title={doc.title}>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <time dateTime={updated}>
            {t("chrome.lastUpdated", {
              date: format.date(updated, { dateStyle: "long" }),
            })}
          </time>
          <span>{t("chrome.readTime", { count: readingMinutes(doc) })}</span>
        </p>
      </PageHeader>
      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 print:block print:py-6">
        <nav aria-labelledby={tocId} className="print:hidden">
          <Collapsible className="rounded-xl border lg:hidden">
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              <span id={tocId}>{t("chrome.contents")}</span>
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="text-muted-foreground transition-transform block-4 inline-4 group-aria-expanded:rotate-180"
              >
                <path
                  d="m4 6 4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-3">
              <LegalToc entries={toc} active={active} />
            </CollapsibleContent>
          </Collapsible>
          <div className="hidden lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100svh-8rem)] lg:flex-col lg:gap-3 lg:overflow-y-auto">
            <p aria-hidden className="ps-3 text-sm font-medium">
              {t("chrome.contents")}
            </p>
            <LegalToc entries={toc} active={active} />
          </div>
        </nav>

        <article className="flex max-w-3xl min-w-0 flex-col gap-10 text-pretty text-muted-foreground print:max-w-none print:text-foreground">
          {lang !== "en" && (
            <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm print:hidden">
              <Trans
                t={t}
                i18nKey="chrome.translationNotice"
                components={{
                  en: (
                    <Link
                      to={localePath("en", path)}
                      lang="en"
                      hrefLang="en"
                      className="font-medium text-foreground underline underline-offset-4"
                    />
                  ),
                }}
              />
            </p>
          )}
          <div className="flex flex-col gap-4 text-lg">
            {doc.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {doc.sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={section.id}
              className="flex flex-col gap-4 print:break-inside-avoid-page"
            >
              <h2
                id={section.id}
                className="scroll-mt-24 text-xl font-semibold tracking-tight text-foreground"
              >
                {section.title}
              </h2>
              <LegalBlocks sectionId={section.id} blocks={section.blocks} />
            </section>
          ))}
          <a
            href="#main"
            className="w-fit text-sm underline underline-offset-4 hover:text-foreground print:hidden"
          >
            {t("chrome.backToTop")}
          </a>
        </article>
      </Container>
    </>
  )
}
