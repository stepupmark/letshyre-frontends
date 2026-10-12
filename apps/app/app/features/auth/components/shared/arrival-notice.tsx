import { useTranslation } from "@workspace/i18n/react"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { CircleCheck } from "lucide-react"

import { useArrival } from "../../hooks/use-arrival"

export function ArrivalNotice() {
  const { t } = useTranslation("auth")
  const { notice } = useArrival()
  if (!notice) return null

  return (
    <Alert>
      <CircleCheck />
      <AlertDescription>{t(`signIn.${notice}`)}</AlertDescription>
    </Alert>
  )
}
