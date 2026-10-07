import type { DesktopOs } from "@workspace/api/public"
import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { useDetectedOs } from "../hooks/use-detected-os"
import { ReleaseCard } from "./release-card"

// fixed order: moving cards once the OS is known would shift the layout
const PLATFORMS = ["windows", "mac"] as const satisfies DesktopOs[]

export function ReleaseList() {
  const { t } = useTranslation("download")
  const detected = useDetectedOs()
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <h2
        id={titleId}
        className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {t("platforms.title")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((os) => (
          <ReleaseCard key={os} os={os} recommended={os === detected} />
        ))}
      </div>
    </section>
  )
}
