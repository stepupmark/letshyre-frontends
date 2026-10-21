import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"

/** A one-time hello beside the launcher; clicking it opens the chat. */
export function LauncherGreeting({
  onOpen,
  onDismiss,
}: {
  onOpen: () => void
  onDismiss: () => void
}) {
  const { t } = useTranslation("home")

  return (
    <div
      role="status"
      className="pop flex max-w-64 items-center gap-1 rounded-2xl rounded-ee-sm border bg-card py-1 ps-3.5 pe-1 text-sm font-medium sm:mb-3 sm:max-w-none"
    >
      <button
        type="button"
        onClick={onOpen}
        className="rounded-sm py-1.5 text-start text-pretty outline-none hover:text-brand-text focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {t("chatbot.greeting")}
      </button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t("chatbot.dismiss")}
        onClick={onDismiss}
        className="text-muted-foreground"
      >
        <XIcon />
      </Button>
    </div>
  )
}
