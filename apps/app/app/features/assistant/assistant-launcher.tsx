import { dirFor } from "@workspace/i18n"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { Maximize2, Sparkles } from "lucide-react"
import { lazy, Suspense, useState } from "react"
import { useLocation } from "react-router"

import { AppLink } from "@/components/app-link"
import { locale } from "@/lib/i18n"

import type { Side } from "./prompts"

const AssistantPanel = lazy(() =>
  import("./assistant-panel").then((m) => ({ default: m.AssistantPanel }))
)

const PAGE: Record<Side, string> = {
  employer: "/employer/chatbot",
  candidate: "/employee/chatbot",
}

/** Topbar button that opens the assistant beside the current page. */
export function AssistantLauncher({ side }: { side: Side }) {
  const { t } = useTranslation("shell")
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  // the page asked from, kept while the sheet is open
  const [from, setFrom] = useState(pathname)
  const [seen, setSeen] = useState(pathname)
  // a link in an answer went somewhere: show that page
  if (seen !== pathname) {
    setSeen(pathname)
    setOpen(false)
  }

  if (pathname === PAGE[side]) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("assistant.open")}
        aria-haspopup="dialog"
        onClick={() => {
          setFrom(pathname)
          setOpen(true)
        }}
      >
        <Sparkles />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={dirFor(locale) === "rtl" ? "left" : "right"}
          className="w-full gap-0 sm:max-w-md"
        >
          <SheetHeader className="border-b pe-12">
            <div className="flex items-center justify-between gap-2">
              <SheetTitle>{t("nav.assistant")}</SheetTitle>
              <AppLink
                to={PAGE[side]}
                aria-label={t("assistant.full")}
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
              >
                <Maximize2 />
              </AppLink>
            </div>
            <SheetDescription>{t("assistant.lead")}</SheetDescription>
          </SheetHeader>
          {open && (
            <Suspense
              fallback={
                <div className="grid flex-1 place-items-center">
                  <Spinner />
                </div>
              }
            >
              <AssistantPanel side={side} from={from} focusOnOpen />
            </Suspense>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
