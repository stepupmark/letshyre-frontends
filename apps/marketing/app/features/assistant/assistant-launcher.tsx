import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { lazy, Suspense, useState } from "react"

import { LauncherFace } from "./components/launcher-face"
import { LauncherGreeting } from "./components/launcher-greeting"
import { useLauncher } from "./hooks/use-launcher"

const AssistantPanel = lazy(() =>
  import("./components/assistant-panel").then((m) => ({
    default: m.AssistantPanel,
  }))
)

/** Corner launcher. The panel's code and copy load on first open. */
export function AssistantLauncher() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const [open, setOpen] = useState(false)
  const launcher = useLauncher()

  const changeOpen = (next: boolean) => {
    if (next) launcher.opened()
    setOpen(next)
  }

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <div className="fixed inset-e-4 bottom-4 z-40 flex items-end gap-2 sm:inset-e-6 sm:bottom-6 print:hidden">
        {launcher.greeting && !open && (
          <LauncherGreeting
            onOpen={() => {
              changeOpen(true)
            }}
            onDismiss={launcher.dismissGreeting}
          />
        )}
        <SheetTrigger
          render={
            <button
              type="button"
              className="launcher group relative grid size-14 shrink-0 place-items-center rounded-full transition-transform duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 motion-reduce:transition-none sm:size-16"
            />
          }
          aria-label={t("chatbot.launcherAria")}
        >
          <LauncherFace quiet={launcher.quiet} />
        </SheetTrigger>
      </div>
      <SheetContent
        side={dirFor(lang) === "rtl" ? "left" : "right"}
        className="gap-0 p-0"
      >
        <SheetHeader className="border-b">
          <SheetTitle>{t("chatbot.title")}</SheetTitle>
        </SheetHeader>
        {open && (
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <AssistantPanel />
          </Suspense>
        )}
      </SheetContent>
    </Sheet>
  )
}
