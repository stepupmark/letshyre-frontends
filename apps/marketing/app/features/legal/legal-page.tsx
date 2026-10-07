import { clearConsent } from "@workspace/analytics"
import { localePath } from "@workspace/i18n"
import {
  Trans,
  useFormat,
  useLocale,
  useTranslation,
} from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  LinkIcon,
  MailIcon,
} from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import { analyticsEnabled } from "@/lib/analytics"
import { PAGES } from "@/lib/pages"
import { SITE } from "@/lib/seo/site"

import { LegalBlocks } from "./components/legal-blocks"
import { LegalToc } from "./components/legal-toc"
import { useActiveSection } from "./hooks/use-active-section"
import {
  buildToc,
  LEGAL_DOCS,
  type LegalDoc,
  type LegalNamespace,
  readingMinutes,
} from "./lib/legal-doc"

const RELATED = [
  { ns: "legalTerms", page: PAGES.terms, label: "footer.links.terms" },
  { ns: "legalPolicy", page: PAGES.privacy, label: "footer.links.privacy" },
  { ns: "legalRefund", page: PAGES.refund, label: "footer.links.refund" },
] as const

export function LegalPage({ ns }: { ns: LegalNamespace }) {
  const { t, i18n } = useTranslation(ns)
  const { t: tc } = useTranslation("common")
  const lang = useLocale()
  const format = useFormat()
  const tocId = useId()
  const relatedId = useId()
  const { key, updated } = LEGAL_DOCS[ns]
  // shape is checked per locale in legal-doc.test.ts
  const doc = i18n.getResource(lang, ns, key) as LegalDoc
  const toc = buildToc(doc)
  const active = useActiveSection(toc.map((entry) => entry.id))
  const path = RELATED.find((r) => r.ns === ns)?.page.path ?? ""

  return (
    <>
      <div
        aria-hidden
        className="read-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand rtl:origin-right"
      />
      <PageHeader eyebrow={tc("footer.legal")} title={doc.title}>
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon aria-hidden className="size-4 text-brand" />
            <time dateTime={updated}>
              {t("chrome.lastUpdated", {
                date: format.date(updated, { dateStyle: "long" }),
              })}
            </time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon aria-hidden className="size-4 text-brand" />
            {t("chrome.readTime", { count: readingMinutes(doc, lang) })}
          </span>
        </p>
      </PageHeader>

      <Container className="grid gap-8 py-8 sm:py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 print:block print:py-6">
        <nav aria-labelledby={tocId} className="print:hidden">
          <Collapsible className="rounded-xl border lg:hidden">
            <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              <span id={tocId}>{t("chrome.contents")}</span>
              <ChevronDownIcon
                aria-hidden
                className="size-4 text-muted-foreground transition-transform group-aria-expanded:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-3">
              <LegalToc entries={toc} active={active} />
            </CollapsibleContent>
          </Collapsible>
          <div className="hidden lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100svh-7rem)] lg:flex-col lg:gap-2 lg:overflow-y-auto">
            <p
              aria-hidden
              className="ps-3 text-xs font-semibold text-muted-foreground uppercase"
            >
              {t("chrome.contents")}
            </p>
            <LegalToc entries={toc} active={active} />
          </div>
        </nav>

        <article className="flex max-w-3xl min-w-0 flex-col gap-8 leading-relaxed text-pretty text-muted-foreground print:max-w-none print:text-foreground">
          {lang !== "en" && (
            <p className="rounded-e-lg border-s-2 border-brand bg-muted/50 px-4 py-3 text-sm print:hidden">
              <Trans
                t={t}
                i18nKey="chrome.translationNotice"
                components={{
                  en: (
                    <Link
                      to={localePath("en", path)}
                      lang="en"
                      hrefLang="en"
                      className="font-medium text-primary underline underline-offset-4"
                    />
                  ),
                }}
              />
            </p>
          )}

          <div className="flex flex-col gap-3 text-lg text-foreground">
            {doc.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {doc.sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={section.id}
              className="flex flex-col gap-3 print:break-inside-avoid-page"
            >
              <div className="group/heading flex items-baseline gap-2">
                <h2
                  id={section.id}
                  className="scroll-mt-24 text-xl font-semibold tracking-tight text-foreground"
                >
                  <SectionTitle title={section.title} />
                </h2>
                <a
                  href={`#${section.id}`}
                  aria-label={tc("legal.sectionLink")}
                  className="rounded-sm text-muted-foreground opacity-0 outline-none group-hover/heading:opacity-100 hover:text-primary focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 print:hidden"
                >
                  <LinkIcon aria-hidden className="size-4" />
                </a>
              </div>
              <LegalBlocks sectionId={section.id} blocks={section.blocks} />
            </section>
          ))}

          {ns === "legalPolicy" && analyticsEnabled && (
            <Button
              variant="outline"
              className="w-fit print:hidden"
              onClick={clearConsent}
            >
              {tc("legal.manageCookies")}
            </Button>
          )}

          <aside className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 print:hidden">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-foreground">
                {tc("support.title")}
              </h2>
              <p className="text-sm">{tc("support.body")}</p>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MailIcon aria-hidden className="size-4" />
                {SITE.email}
              </a>
            </div>
            <Link
              to={localePath(lang, PAGES.contact.path)}
              className={buttonVariants({ variant: "outline" })}
            >
              {tc("support.contact")}
            </Link>
          </aside>

          <nav
            aria-labelledby={relatedId}
            className="flex flex-col gap-2 print:hidden"
          >
            <h2
              id={relatedId}
              className="text-sm font-semibold text-foreground"
            >
              {tc("legal.related")}
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {RELATED.filter((r) => r.ns !== ns).map((r) => (
                <li key={r.ns}>
                  <Link
                    to={localePath(lang, r.page.path)}
                    className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {tc(r.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="#main"
            className="w-fit rounded-sm text-sm underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 print:hidden"
          >
            {t("chrome.backToTop")}
          </a>
        </article>
      </Container>
    </>
  )
}

/** Colours the leading "7.". The heading still reads as one string. */
function SectionTitle({ title }: { title: string }) {
  const [, number, rest] = /^(\d+\.)\s*(.*)$/.exec(title) ?? []
  if (!number) return <span>{title}</span>
  return (
    <span>
      <span className="text-primary tabular-nums">{number}</span> {rest}
    </span>
  )
}
