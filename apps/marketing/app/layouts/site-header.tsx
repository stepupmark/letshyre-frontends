import { Logo } from "@workspace/blocks/logo"
import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@workspace/ui/components/navigation-menu"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { Link } from "react-router"

import { Container } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { useCompactNav } from "./site-header-compact"
import { SiteLanguageSwitcher } from "./site-header-language"
import { SiteHeaderMenu } from "./site-header-menu"
import { SiteThemeToggle } from "./site-header-theme"
import {
  NAV_ITEMS,
  PRODUCT_ITEMS,
  navHref,
  useCurrent,
} from "./site-header-nav"

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
  const current = useCurrent()
  const rowRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const compact = useCompactNav(rowRef, listRef, lang)
  const scrolled = useScrolled()
  const productCurrent = PRODUCT_ITEMS.some((item) => current(item))

  return (
    <header
      data-compact={compact || undefined}
      data-scrolled={scrolled || undefined}
      className="group/header sticky top-0 z-40 border-b border-transparent bg-background transition-[background-color,border-color,box-shadow] data-scrolled:border-border data-scrolled:bg-background/85 data-scrolled:shadow-xs data-scrolled:backdrop-blur-md print:hidden"
    >
      <Container>
        <div
          ref={rowRef}
          className="flex h-16 items-center gap-4 lg:h-18 lg:gap-8"
        >
          <div className="flex flex-1 basis-0">
            <Link
              to={localePath(lang)}
              className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Logo label={t("nav.logoAlt")} />
            </Link>
          </div>

          <NavigationMenu
            align="center"
            aria-label={t("nav.primaryAria")}
            className="hidden min-w-0 flex-initial self-stretch lg:flex lg:group-data-compact/header:hidden"
          >
            <NavigationMenuList
              ref={listRef}
              className="min-w-0 gap-1 self-stretch overflow-hidden"
            >
              <NavigationMenuItem className="shrink-0">
                <NavigationMenuTrigger
                  data-current={productCurrent || undefined}
                  className="group/link h-11 bg-transparent px-3 text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent data-current:text-foreground data-popup-open:bg-transparent data-popup-open:text-foreground data-popup-open:hover:bg-transparent data-open:bg-transparent data-open:text-foreground data-open:hover:bg-transparent data-open:focus:bg-transparent"
                >
                  <NavLabel>{t("footer.product")}</NavLabel>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-88 p-1.5">
                  <ul className="flex flex-col gap-0.5">
                    {PRODUCT_ITEMS.map((item) => (
                      <li key={item.id}>
                        <NavigationMenuLink
                          render={
                            <Link to={navHref(lang, item)} prefetch="intent" />
                          }
                          active={current(item) === "page"}
                          closeOnClick
                          className="items-start gap-3 p-2.5"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-brand">
                            <item.icon aria-hidden className="size-4.5" />
                          </span>
                          <span className="flex flex-col gap-0.5">
                            <span className="font-medium">{t(item.label)}</span>
                            <span className="text-muted-foreground">
                              {t(item.description)}
                            </span>
                          </span>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.id} className="shrink-0">
                  <Link
                    to={navHref(lang, item)}
                    prefetch="intent"
                    aria-current={current(item)}
                    data-current={current(item) ? "" : undefined}
                    className="group/link flex h-11 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-current:text-foreground"
                  >
                    <NavLabel>{t(item.label)}</NavLabel>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex flex-1 basis-0 items-center justify-end gap-1 sm:gap-2">
            <SiteLanguageSwitcher
              display="code"
              className="hidden sm:inline-flex lg:hidden"
            />
            <SiteLanguageSwitcher className="hidden lg:inline-flex" />
            <SiteThemeToggle className="cursor-pointer" />
            <a
              href={APP_LINKS.getStarted}
              className={buttonVariants({
                size: "lg",
                className: "max-sm:hidden",
              })}
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

/** Text with the brand bar: faint on hover, solid on the current page. */
function NavLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative whitespace-nowrap after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand/35 after:transition-transform after:duration-200 group-hover/link:after:scale-x-100 group-data-current/link:after:scale-x-100 group-data-current/link:after:bg-brand motion-reduce:after:transition-none">
      {children}
    </span>
  )
}
