import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import { AssistantFace } from "./assistant-face"

/** Names the popover or the sheet, whichever holds the panel. */
export type PanelTitle = ComponentType<{
  className?: string
  children: ReactNode
}>

/** Eager, so the panel has its name while its chunk loads. */
export function PanelHeader({
  Title,
  actions,
  onClose,
}: {
  Title: PanelTitle
  actions?: ReactNode
  onClose: () => void
}) {
  const { t } = useTranslation("home")

  return (
    <header className="flex items-center gap-3 border-b py-3 ps-4 pe-2">
      <AssistantFace className="size-9" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Title className="truncate font-heading text-base font-medium">
          {t("chatbot.title")}
        </Title>
        <p className="truncate text-xs text-muted-foreground">
          {t("chatbot.subtitle")}
        </p>
      </div>
      {actions}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("chatbot.close")}
        onClick={onClose}
      >
        <XIcon />
      </Button>
    </header>
  )
}
