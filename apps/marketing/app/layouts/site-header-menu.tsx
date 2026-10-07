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
import { type ComponentProps, useState } from "react"
import { Link } from "react-router"

import { APP_LINKS } from "@/lib/app-links"

import { MenuIcon, XIcon } from "lucide-react"
import { FOOTER_COLUMNS } from "./site-footer-links"
import { SiteLanguageSwitcher } from "./site-header-language"
import { NAV_ITEMS, navHref, useIsCurrent } from "./site-header-nav"

const CANDIDATE_LINKS = FOOTER_COLUMNS[1].links

export function SiteHeaderMenu({ className }: { className?: string }) {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const isCurrent = useIsCurrent()
  const [open, setOpen] = useState(false)
  const close = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon-lg" className={className} />}
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
          <nav aria-label={t("nav.mobileAria")} className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <MenuLink
                key={item.id}
                to={navHref(lang, item)}
                aria-current={isCurrent(item) ? "page" : undefined}
                onClick={close}
                className="aria-[current=page]:rounded-s-none aria-[current=page]:border-s-brand aria-[current=page]:text-foreground"
              >
                {t(item.label)}
              </MenuLink>
            ))}
          </nav>

          <section aria-labelledby="menu-candidates" className="flex flex-col">
            <h2
              id="menu-candidates"
              className="px-3 pb-1 text-xs font-medium text-muted-foreground"
            >
              {t("footer.candidates")}
            </h2>
            {CANDIDATE_LINKS.map((link) => (
              <MenuLink
                key={link.label}
                to={"href" in link ? link.href : localePath(lang, link.path)}
                onClick={close}
              >
                {t(link.label)}
              </MenuLink>
            ))}
          </section>

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
        "flex min-h-12 items-center rounded-md border-s-2 border-transparent px-3 text-base font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}
