import { useTranslation } from "@workspace/i18n/react"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { XIcon } from "lucide-react"
import { lazy, Suspense, useState, type ComponentProps } from "react"

import { LauncherFace } from "./components/launcher-face"
import { LauncherGreeting } from "./components/launcher-greeting"
import { PanelHeader, type PanelTitle } from "./components/panel-header"
import { useLauncher } from "./hooks/use-launcher"

const AssistantPanel = lazy(() =>
  import("./components/assistant-panel").then((m) => ({
    default: m.AssistantPanel,
  }))
)

type OpenChange = NonNullable<ComponentProps<typeof Popover>["onOpenChange"]>

/**
 * Corner launcher. On wide screens the chat floats above it without covering
 * the page, so visitors can read while they ask; on phones it is a full-screen
 * sheet. The panel's code and copy load on first open.
 */
export function AssistantLauncher() {
  const { t } = useTranslation("home")
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState(false)
  const launcher = useLauncher()

  const show = () => {
    launcher.opened()
    // the popover can't fill a phone screen: its positioner traps fixed children
    setPhone(!matchMedia("(min-width: 48rem)").matches)
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
  }

  const changeOpen: OpenChange = (next, { reason }) => {
    if (next) show()
    // reading or clicking the page keeps the chat open; Escape, the X and the launcher close it
    else if (reason !== "outside-press" && reason !== "focus-out") close()
  }

  const panel = (Title: PanelTitle) => (
    <Suspense
      fallback={
        <>
          <PanelHeader Title={Title} onClose={close} />
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        </>
      }
    >
      <AssistantPanel Title={Title} onClose={close} />
    </Suspense>
  )

  return (
    <>
      <Popover open={open && !phone} onOpenChange={changeOpen} modal={false}>
        <div className="fixed inset-e-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:inset-e-6 sm:bottom-6 sm:flex-row print:hidden">
          {launcher.greeting && !open && (
            <LauncherGreeting
              onOpen={show}
              onDismiss={launcher.dismissGreeting}
            />
          )}
          <PopoverTrigger
            render={
              <button
                type="button"
                className="launcher group relative grid size-14 shrink-0 place-items-center rounded-full transition-transform duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 motion-reduce:transition-none sm:size-16"
              />
            }
            aria-label={open ? t("chatbot.close") : t("chatbot.launcherAria")}
          >
            {open ? (
              <span className="grid size-full animate-in place-items-center rounded-full bg-primary text-primary-foreground duration-200 zoom-in-75 fade-in motion-reduce:animate-none">
                <XIcon aria-hidden className="size-6" />
              </span>
            ) : (
              <LauncherFace quiet={launcher.quiet} />
            )}
          </PopoverTrigger>
        </div>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          className="h-[min(40rem,calc(100dvh-8rem))] w-100 gap-0 overflow-hidden rounded-2xl border p-0 shadow-none ring-0 motion-reduce:animate-none"
        >
          {panel(PopoverTitle)}
        </PopoverContent>
      </Popover>
      <Sheet
        open={open && phone}
        onOpenChange={(next) => {
          if (!next) close()
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="gap-0 p-0 data-[side=bottom]:h-dvh data-[side=bottom]:border-t-0"
        >
          {panel(SheetTitle)}
        </SheetContent>
      </Sheet>
    </>
  )
}
