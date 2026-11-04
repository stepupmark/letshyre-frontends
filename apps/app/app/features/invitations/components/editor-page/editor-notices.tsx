import { useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Lock, TriangleAlert } from "lucide-react"

export function ReadOnlyNotice() {
  const { t } = useTranslation("invitations")
  return (
    <Alert>
      <Lock />
      <AlertTitle>{t("editor.readOnlyTitle")}</AlertTitle>
      <AlertDescription>{t("editor.readOnlyBody")}</AlertDescription>
    </Alert>
  )
}

export function FidelityNotice({ onConvert }: { onConvert: () => void }) {
  const { t } = useTranslation("invitations")
  return (
    <Alert>
      <TriangleAlert />
      <AlertTitle>{t("editor.fidelityTitle")}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        {t("editor.fidelityBody")}
        <Button variant="outline" size="sm" onClick={onConvert}>
          {t("editor.fidelityConvert")}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
