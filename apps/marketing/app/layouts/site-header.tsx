import { Logo } from "@workspace/blocks/logo"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { useCompactNav } from "./site-header-compact"
import { SiteLanguageSwitcher } from "./site-header-language"
import { SiteHeaderMenu } from "./site-header-menu"
import { NAV_ITEMS, navHref, useIsCurrent } from "./site-header-nav"

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 0)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => {
      window.removeEventListener("scroll", update)
    }
  }, [])

  return scrolled
}

export function SiteHeader() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const isCurrent = useIsCurrent()
  const rowRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const compact = useCompactNav(rowRef, navRef, lang)
  const scrolled = useScrolled()

  return (
    <header
      data-compact={compact || undefined}
      data-scrolled={scrolled || undefined}
      className="group/header sticky top-0 z-40 border-b border-transparent bg-background/95 transition-colors data-scrolled:border-border print:hidden"
    >
      <Container>
        <div ref={rowRef} className="flex h-16 items-center gap-6">
          <Link
            to={localePath(lang)}
            className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo label={t("nav.logoAlt")} />
          </Link>

          <nav
            ref={navRef}
            aria-label={t("nav.primaryAria")}
            className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden lg:flex lg:group-data-compact/header:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={navHref(lang, item)}
                aria-current={isCurrent(item) ? "page" : undefined}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-foreground"
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-2">
            <SiteLanguageSwitcher />
            <a
              href={APP_LINKS.logIn}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className:
                    "hidden lg:inline-flex lg:group-data-compact/header:hidden",
                })
              )}
            >
              {t("nav.logIn")}
            </a>
            <a
              href={APP_LINKS.employerRegister}
              className={cn(
                buttonVariants({
                  className:
                    "hidden lg:inline-flex lg:group-data-compact/header:hidden",
                })
              )}
            >
              {t("nav.getStarted")}
            </a>
            <SiteHeaderMenu className="lg:hidden lg:group-data-compact/header:inline-flex" />
          </div>
        </div>
      </Container>
    </header>
  )
}
