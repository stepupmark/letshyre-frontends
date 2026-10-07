import { Logo } from "@workspace/blocks/logo"
import { dirFor, localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { Link } from "react-router"

import { APP_LINKS } from "@/lib/app-links"

import { MenuIcon, XIcon } from "lucide-react"
import { FOOTER_COLUMNS } from "./site-footer-links"
import { SiteLanguageSwitcher } from "./site-header-language"
import {
  NAV_ITEMS,
  type NavItem,
  PRODUCT_ITEMS,
  navHref,
  useCurrent,
} from "./site-header-nav"

const CANDIDATE_LINKS = FOOTER_COLUMNS[1].links

export function SiteHeaderMenu({ className }: { className?: string }) {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const current = useCurrent()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const close = () => {
    setOpen(false)
  }

  // the trigger hides once the desktop nav fits, so the sheet shouldn't linger
  useEffect(() => {
    if (!open) return
    const onResize = () => {
      if (!triggerRef.current?.offsetParent) setOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [open])

  const navLink = (item: NavItem) => (
    <MenuLink
      key={item.id}
      to={navHref(lang, item)}
      aria-current={current(item)}
      onClick={close}
      data-current={current(item) ? "" : undefined}
    >
      {t(item.label)}
    </MenuLink>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon-lg"
            className={className}
          />
        }
        aria-label={t("nav.toggle")}
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent
        side={dirFor(lang) === "rtl" ? "left" : "right"}
        showCloseButton={false}
        className="w-full gap-0 sm:max-w-sm"
      >
        <SheetHeader className="h-16 flex-row items-center justify-between border-b px-4 py-0">
          <Logo label={t("nav.logoAlt")} />
          <SheetTitle className="sr-only">{t("nav.siteNavigation")}</SheetTitle>
          <SheetClose
            render={<Button variant="ghost" size="icon-lg" />}
            aria-label={t("nav.close")}
          >
            <XIcon />
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-3">
          <nav aria-label={t("nav.mobileAria")} className="flex flex-col gap-6">
            <MenuGroup title={t("footer.product")}>
              {PRODUCT_ITEMS.map(navLink)}
            </MenuGroup>
            <MenuGroup title={t("footer.company")}>
              {NAV_ITEMS.map(navLink)}
            </MenuGroup>
          </nav>

          <MenuGroup title={t("footer.candidates")}>
            {CANDIDATE_LINKS.map((link) => (
              <MenuLink
                key={link.label}
                to={"href" in link ? link.href : localePath(lang, link.path)}
                onClick={close}
              >
                {t(link.label)}
              </MenuLink>
            ))}
          </MenuGroup>

          <div className="flex items-center justify-between gap-3 border-t px-3 pt-4">
            <span className="text-sm text-muted-foreground">
              {t("nav.language")}
            </span>
            <SiteLanguageSwitcher />
          </div>
        </div>

        <SheetFooter className="grid grid-cols-2 border-t">
          <a
            href={APP_LINKS.logIn}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("nav.logIn")}
          </a>
          <a
            href={APP_LINKS.employerRegister}
            className={buttonVariants({ size: "lg" })}
          >
            {t("nav.getStarted")}
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function MenuLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "flex min-h-12 items-center rounded-md border-s-2 border-transparent px-3 text-base font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-current:rounded-s-none data-current:border-s-brand data-current:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenuGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col">
      <h2 className="px-3 pb-1 text-xs font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}
