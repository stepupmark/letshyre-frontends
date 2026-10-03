import { useTranslation } from "@workspace/i18n/react"

import { useDetectedOs } from "../hooks/use-detected-os"
import { orderForDevice } from "../lib/detect-os"
import { ReleaseCard } from "./release-card"

export function ReleaseList() {
  const { t } = useTranslation("download")
  const detected = useDetectedOs()

  return (
    <div className="flex flex-col gap-4">
      {detected === "other" && (
        <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-pretty">
          {t("release.unsupported")}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {orderForDevice(detected).map((os) => (
          <ReleaseCard key={os} os={os} recommended={os === detected} />
        ))}
      </div>
    </div>
  )
}
