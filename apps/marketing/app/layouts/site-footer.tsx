import { Logo } from "@workspace/blocks/logo"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { SocialLinks } from "@/components/social-links"
import { NewsletterForm } from "@/features/newsletter"
import { SITE } from "@/lib/seo/site"

import { FOOTER_COLUMNS } from "./site-footer-links"
import { SiteLanguageSwitcher } from "./site-header-language"

export function SiteFooter() {
  const { t } = useTranslation("common")
  const lang = useLocale()

  return (
    <footer className="border-t bg-muted/40 print:hidden">
      <Container className="flex flex-col gap-10 pt-12 pb-8 sm:pt-16">
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

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-8">
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
                  className="flex flex-col gap-2.5"
                >
                  {column.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={
                          "href" in item
                            ? item.href
                            : "hash" in item
                              ? `${localePath(lang, item.path)}#${item.hash}`
                              : localePath(lang, item.path)
                        }
                        className="rounded-sm text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {t(item.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-8">
          <NewsletterForm />
        </div>

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
      </Container>
    </footer>
  )
}
