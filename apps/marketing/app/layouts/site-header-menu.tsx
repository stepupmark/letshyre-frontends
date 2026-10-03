import { dirFor } from "@workspace/i18n"
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
import { useState } from "react"
import { Link } from "react-router"

import { APP_LINKS } from "@/lib/app-links"

import { MenuIcon, XIcon } from "lucide-react"
import { NAV_ITEMS, navHref, useIsCurrent } from "./site-header-nav"

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
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-sm text-muted-foreground">
            {t("nav.siteNavigation")}
          </SheetTitle>
          <SheetClose
            render={<Button variant="ghost" size="icon-lg" />}
            aria-label={t("nav.close")}
          >
            <XIcon />
          </SheetClose>
        </SheetHeader>
        <nav
          aria-label={t("nav.mobileAria")}
          className="flex flex-col px-4 py-2"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              to={navHref(lang, item)}
              aria-current={isCurrent(item) ? "page" : undefined}
              onClick={close}
              className="border-b py-3 text-lg font-medium text-muted-foreground outline-none last:border-b-0 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-foreground"
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <SheetFooter className="border-t">
          <a
            href={APP_LINKS.logIn}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {t("nav.logIn")}
          </a>
          <a
            href={APP_LINKS.employerRegister}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {t("nav.getStarted")}
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
