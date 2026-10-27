import { Dialog } from "@base-ui/react/dialog"
import { useTranslation } from "@workspace/i18n/react"
import { Spinner } from "@workspace/ui/components/spinner"
import { XIcon } from "lucide-react"
import { lazy, Suspense, useRef, useState } from "react"

import { LauncherFace } from "./components/launcher-face"
import { LauncherGreeting } from "./components/launcher-greeting"
import { PanelHeader } from "./components/panel-header"
import { useLauncher } from "./hooks/use-launcher"

const AssistantPanel = lazy(() =>
  import("./components/assistant-panel").then((m) => ({
    default: m.AssistantPanel,
  }))
)

/**
 * Corner launcher. On wide screens the chat floats above it without covering
 * the page, so visitors can read while they ask; on phones it fills the screen.
 * The panel's code and copy load on first open.
 */
export function AssistantLauncher() {
  const { t } = useTranslation("home")
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState(false)
  const launcher = useLauncher()
  const button = useRef<HTMLButtonElement>(null)

  const changeOpen = (next: boolean) => {
    if (next) {
      launcher.opened()
      // full screen on a phone, so the page behind shouldn't take focus
      setPhone(!matchMedia("(min-width: 48rem)").matches)
    }
    setOpen(next)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={changeOpen}
      modal={phone ? "trap-focus" : false}
      disablePointerDismissal
    >
      <div className="fixed inset-e-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:inset-e-6 sm:bottom-6 sm:flex-row print:hidden">
        {launcher.greeting && !open && (
          <LauncherGreeting
            onOpen={() => {
              changeOpen(true)
            }}
            onDismiss={launcher.dismissGreeting}
          />
        )}
        <button
          ref={button}
          type="button"
          aria-label={open ? t("chatbot.close") : t("chatbot.launcherAria")}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="launcher group relative grid size-14 shrink-0 place-items-center rounded-full transition-transform duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 motion-reduce:transition-none sm:size-16"
          onClick={() => {
            changeOpen(!open)
          }}
        >
          {open ? (
            <span className="grid size-full animate-in place-items-center rounded-full bg-primary text-primary-foreground duration-200 zoom-in-75 fade-in motion-reduce:animate-none">
              <XIcon aria-hidden className="size-6" />
            </span>
          ) : (
            <LauncherFace quiet={launcher.quiet} />
          )}
        </button>
      </div>
      <Dialog.Portal>
        <Dialog.Popup
          finalFocus={button}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-popover text-sm text-popover-foreground transition-[translate,opacity] duration-200 ease-out outline-none data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0 motion-reduce:transition-none md:inset-auto md:inset-e-6 md:bottom-24 md:h-[min(40rem,calc(100dvh-8rem))] md:w-100 md:rounded-2xl md:border"
        >
          <Suspense
            fallback={
              <>
                <PanelHeader />
                <div className="flex flex-1 items-center justify-center">
                  <Spinner />
                </div>
              </>
            }
          >
            <AssistantPanel />
          </Suspense>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
