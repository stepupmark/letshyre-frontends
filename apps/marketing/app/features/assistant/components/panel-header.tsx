import { Dialog } from "@base-ui/react/dialog"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"
import type { ReactNode } from "react"

import { AssistantFace } from "./assistant-face"

/** Eager, so the dialog has its name while the panel's chunk loads. */
export function PanelHeader({ actions }: { actions?: ReactNode }) {
  const { t } = useTranslation("home")

  return (
    <header className="flex items-center gap-3 border-b py-3 ps-4 pe-2">
      <AssistantFace className="size-9" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Dialog.Title className="truncate font-heading text-base font-medium">
          {t("chatbot.title")}
        </Dialog.Title>
        <p className="truncate text-xs text-muted-foreground">
          {t("chatbot.subtitle")}
        </p>
      </div>
      {actions}
      <Dialog.Close
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("chatbot.close")}
          />
        }
      >
        <XIcon />
      </Dialog.Close>
    </header>
  )
}
