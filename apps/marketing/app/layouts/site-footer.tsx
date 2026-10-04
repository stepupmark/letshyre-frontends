import { Logo } from "@workspace/blocks/logo"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { lazy, Suspense } from "react"
import { Link } from "react-router"

import { Container } from "@/components/section"

import { FOOTER_COLUMNS } from "./site-footer-links"
import { SiteFooterSocial } from "./site-footer-social"
import { SiteLanguageSwitcher } from "./site-header-language"

// prerendered as usual; the form code (react-hook-form, zod) loads after first paint
const NewsletterForm = lazy(() =>
  import("@/features/newsletter").then((m) => ({ default: m.NewsletterForm }))
)

export function SiteFooter() {
  const { t } = useTranslation("common")
  const lang = useLocale()

  return (
    <footer className="border-t print:hidden">
      <Container className="flex flex-col gap-12 py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="flex max-w-sm flex-col gap-6 lg:col-span-2">
            <Link
              to={localePath(lang)}
              className="w-fit rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Logo label={t("nav.logoAlt")} />
            </Link>
            <p className="text-sm text-pretty text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <Suspense>
              <NewsletterForm />
            </Suspense>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col gap-3">
                <h2
                  id={`footer-${column.id}`}
                  className="text-sm font-semibold"
                >
                  {t(column.title)}
                </h2>
                <ul
                  aria-labelledby={`footer-${column.id}`}
                  className="flex flex-col gap-2"
                >
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {"href" in link ? (
                        <a
                          href={link.href}
                          className="rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {t(link.label)}
                        </a>
                      ) : (
                        <Link
                          to={
                            "hash" in link
                              ? `${localePath(lang, link.path)}#${link.hash}`
                              : localePath(lang, link.path)
                          }
                          className="rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {t(link.label)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SiteLanguageSwitcher />
            <SiteFooterSocial />
          </div>
        </div>
      </Container>
    </footer>
  )
}
