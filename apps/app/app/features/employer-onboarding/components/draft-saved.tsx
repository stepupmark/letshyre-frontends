import { useTranslation } from "@workspace/i18n/react"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"

const ANNOUNCED = "employer-onboarding:draft-announced"

/** Shown on every save; read out once a session so it doesn't interrupt typing. */
export function DraftSaved({ saves }: { saves: number }) {
  const { t } = useTranslation("onboarding")
  const [heardBefore] = useState(() => {
    try {
      return sessionStorage.getItem(ANNOUNCED) !== null
    } catch {
      return false
    }
  })
  const announce = saves > 0 && !heardBefore

  useEffect(() => {
    if (!announce) return
    try {
      sessionStorage.setItem(ANNOUNCED, "1")
    } catch {
      /* empty */
    }
  }, [announce])

  return (
    <>
      <p
        aria-hidden="true"
        className="flex h-5 items-center gap-1.5 text-xs text-muted-foreground"
      >
        {saves > 0 && (
          <>
            <Check
              key={saves}
              className="pop size-3.5 text-success"
              strokeWidth={2.5}
            />
            {t("draftSaved")}
          </>
        )}
      </p>
      <p role="status" className="sr-only">
        {announce ? t("draftSaved") : ""}
      </p>
    </>
  )
}
