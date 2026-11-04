import { useTranslation } from "@workspace/i18n/react"
import { Eye } from "lucide-react"

export function PreviewCard({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation("invitations")
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex items-center gap-3 rounded-lg border p-4 text-start text-sm transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand-text transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
      >
        <Eye className="size-4" />
      </span>
      <span className="flex flex-col">
        <span className="font-medium">{t("editor.previewCard")}</span>
        <span className="text-muted-foreground">
          {t("editor.previewCardBody")}
        </span>
      </span>
    </button>
  )
}
