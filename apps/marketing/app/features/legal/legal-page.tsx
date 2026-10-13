import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { useActiveSection } from "@/hooks/use-active-section"

import { BackToTop } from "./components/back-to-top"
import { LegalFooter } from "./components/legal-footer"
import { LegalHeader } from "./components/legal-header"
import { LegalMobileNav, LegalNav } from "./components/legal-nav"
import { LegalSection } from "./components/legal-section"
import {
  buildToc,
  LEGAL_DOCS,
  type LegalDoc,
  type LegalNamespace,
  readingMinutes,
} from "./lib/legal-doc"

export function LegalPage({ ns }: { ns: LegalNamespace }) {
  const { t, i18n } = useTranslation(ns)
  const lang = useLocale()
  const { key, updated, path } = LEGAL_DOCS[ns]
  // shape is checked per locale in legal-doc.test.ts
  const doc = i18n.getResource(lang, ns, key) as LegalDoc
  const toc = buildToc(doc)
  const active = useActiveSection(
    toc.flatMap((entry) => [
      entry.id,
      ...entry.children.map((child) => child.id),
    ])
  )
  const nav = { label: t("chrome.contents"), entries: toc, active }

  return (
    <div className="relative">
      <div
        aria-hidden
        className="read-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brand rtl:origin-right"
      />
      <BackToTop label={t("chrome.backToTop")} />
      <LegalHeader
        ns={ns}
        title={doc.title}
        updated={updated}
        minutes={readingMinutes(doc, lang)}
      />
      <LegalMobileNav {...nav} />

      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 print:block print:py-6">
        <LegalNav {...nav} />

        <article className="flex max-w-[65ch] min-w-0 flex-col gap-12 text-base/[1.6] text-pretty text-foreground/85 print:max-w-none print:text-foreground">
          {lang !== "en" && (
            <p className="rounded-xl border bg-muted/50 px-4 py-3 text-sm print:hidden">
              <Trans
                t={t}
                i18nKey="chrome.translationNotice"
                components={{
                  en: (
                    <Link
                      to={localePath("en", path)}
                      lang="en"
                      hrefLang="en"
                      className="text-link"
                    />
                  ),
                }}
              />
            </p>
          )}

          <div className="flex flex-col gap-3 text-lg/[1.55] text-foreground">
            {doc.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {doc.sections.map((section) => (
            <LegalSection key={section.id} section={section} />
          ))}

          <LegalFooter ns={ns} />
        </article>
      </Container>
    </div>
  )
}
