import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Spinner } from "@workspace/ui/components/spinner"
import { MessageCircleIcon } from "lucide-react"
import { lazy, Suspense, useState } from "react"

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            size="icon-lg"
            className="fixed inset-e-4 bottom-4 z-40 rounded-full shadow-md print:hidden"
          />
        }
        aria-label={t("chatbot.launcherAria")}
      >
        <MessageCircleIcon aria-hidden />
      </SheetTrigger>
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
