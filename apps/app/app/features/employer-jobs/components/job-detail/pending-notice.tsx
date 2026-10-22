import { useTranslation } from "@workspace/i18n/react"
import { Hourglass } from "lucide-react"

export function PendingNotice() {
  const { t } = useTranslation("jobs")
  return (
    <div
      role="status"
      className="settle flex items-start gap-3 rounded-lg border p-4 text-sm"
    >
      <Hourglass
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-warning"
      />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">{t("detail.pendingTitle")}</p>
        <p className="text-pretty text-muted-foreground">
          {t("detail.pendingBody")}
        </p>
      </div>
    </div>
  )
}
