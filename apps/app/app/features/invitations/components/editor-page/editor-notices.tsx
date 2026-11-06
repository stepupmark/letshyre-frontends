import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { History, TriangleAlert } from "lucide-react"

export function FidelityNotice({ onConvert }: { onConvert: () => void }) {
  const { t } = useTranslation("invitations")
  return (
    <Alert>
      <TriangleAlert />
      <AlertTitle className="flex flex-wrap items-center justify-between gap-3 font-normal">
        {t("editor.fidelityNote")}
        <Button variant="outline" size="sm" onClick={onConvert}>
          {t("editor.fidelityConvert")}
        </Button>
      </AlertTitle>
    </Alert>
  )
}

export function DraftNotice({
  onRestore,
  onDiscard,
}: {
  onRestore: () => void
  onDiscard: () => void
}) {
  const { t } = useTranslation("invitations")
  return (
    <Alert>
      <History />
      <AlertTitle className="flex flex-wrap items-center justify-between gap-3 font-normal">
        {t("draft.prompt")}
        <span className="flex gap-2">
          <Button size="sm" onClick={onRestore}>
            {t("draft.restore")}
          </Button>
          <Button size="sm" variant="outline" onClick={onDiscard}>
            {t("draft.discard")}
          </Button>
        </span>
      </AlertTitle>
    </Alert>
  )
}
