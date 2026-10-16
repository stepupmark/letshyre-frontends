import { Logo } from "@workspace/blocks/logo"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowUpRightIcon } from "lucide-react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { usePublished } from "@/hooks/use-published"
import { SocialLinks } from "@/components/social-links"
import { NewsletterForm } from "@/features/newsletter"
import { SITE } from "@/lib/seo/site"

import { FOOTER_COLUMNS } from "./site-footer-links"
import { SiteLanguageSwitcher } from "./site-header-language"

export function SiteFooter() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const published = usePublished()

  return (
    <footer className="border-t bg-muted/40 print:hidden">
      <Container className="flex flex-col gap-10 pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="flex max-w-sm flex-col gap-4 lg:col-span-4">
            <Link
              to={localePath(lang)}
              className="w-fit rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Logo label={t("nav.logoAlt")} />
            </Link>
            <p className="text-sm text-pretty text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="w-fit rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {SITE.email}
            </a>
          </div>

          <nav
            aria-label={t("footer.nav")}
            className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-8"
          >
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
                  className="flex flex-col gap-1"
                >
                  {column.links
                    .filter((item) => !("page" in item) || published(item.page))
                    .map((item) => (
                      <li key={item.label}>
                        <Link
                          to={
                            "href" in item
                              ? item.href
                              : localePath(lang, item.path)
                          }
                          className="group/link inline-flex items-center gap-1 rounded-sm py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {t(item.label)}
                          {"href" in item && (
                            <>
                              <ArrowUpRightIcon
                                aria-hidden
                                className="size-3.5 opacity-60 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100"
                              />
                              <span className="sr-only">
                                {t("footer.opensApp")}
                              </span>
                            </>
                          )}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <NewsletterForm />

        <div className="flex flex-col-reverse gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <SiteLanguageSwitcher side="top" className="-ms-2.5" />
            <span aria-hidden className="hidden h-5 w-px bg-border sm:block" />
            <SocialLinks />
          </div>
        </div>

        <div
          aria-hidden
          className="reveal aspect-1223/300 w-full bg-linear-to-b from-brand/55 to-brand/10 mask-[url(/footer-logo.webp)] mask-contain mask-center mask-no-repeat max-sm:-mt-4 dark:from-brand-text/45 dark:to-brand-text/10"
        />
      </Container>
    </footer>
  )
}
