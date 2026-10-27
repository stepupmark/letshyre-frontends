import type { DesktopOs } from "@workspace/api/public"
import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import { SectionHeader } from "@/components/section"

import { useDetectedOs } from "../hooks/use-detected-os"
import { ReleaseCard } from "./release-card"

// fixed order: moving cards once the OS is known would shift the layout
const PLATFORMS = ["windows", "mac"] as const satisfies DesktopOs[]

export function ReleaseList() {
  const { t } = useTranslation("download")
  const detected = useDetectedOs()
  const titleId = useId()

  return (
    <section
      id="platforms"
      aria-labelledby={titleId}
      className="flex flex-col gap-6"
    >
      <SectionHeader id={titleId} title={t("platforms.title")} />
      <ul className="flex flex-col gap-4">
        {PLATFORMS.map((os) => (
          <li key={os}>
            <ReleaseCard os={os} recommended={os === detected} />
          </li>
        ))}
      </ul>
    </section>
  )
}
