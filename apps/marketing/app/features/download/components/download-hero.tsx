import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon } from "lucide-react"

import { PageHeader } from "@/components/section"

import { AppWindow } from "./art/app-window"
import { DetectedDownload } from "./detected-download"

const FEATURES = ["distractionFree", "stable", "secure"] as const

export function DownloadHero() {
  const { t } = useTranslation("download")

  return (
    <PageHeader
      eyebrow={t("meta.crumb")}
      title={t("title")}
      description={t("subtitle")}
      art={<AppWindow />}
    >
      <ul className="mt-1 flex flex-col gap-2.5 text-sm">
        {FEATURES.map((id) => (
          <li key={id} className="flex items-center gap-2.5">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-muted text-brand-text">
              <CheckIcon aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {t(`features.${id}`)}
          </li>
        ))}
      </ul>
      <DetectedDownload />
    </PageHeader>
  )
}
