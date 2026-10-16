import { Trans, useTranslation } from "@workspace/i18n/react"
import {
  FileTextIcon,
  FilesIcon,
  IdCardIcon,
  LaptopIcon,
  MailIcon,
  ScanFaceIcon,
} from "lucide-react"

import { ReadyGrid } from "@/components/guide/ready-grid"

import { useGuideLinks } from "../hooks/use-guide-links"
import { READY_ANCHOR, READY_ITEMS } from "../lib/chapters"

const ICONS = {
  contact: MailIcon,
  aadhaar: IdCardIcon,
  photo: ScanFaceIcon,
  letters: FilesIcon,
  resume: FileTextIcon,
  computer: LaptopIcon,
} as const

export function KeepReady() {
  const { t } = useTranslation("candidateGuide")
  const links = useGuideLinks()

  return (
    <ReadyGrid
      anchor={READY_ANCHOR}
      title={t("ready.title")}
      description={t("ready.description")}
      items={READY_ITEMS.map((id) => ({
        id,
        icon: ICONS[id],
        title: t(`ready.items.${id}.title`),
        desc: (
          <Trans t={t} i18nKey={`ready.items.${id}.desc`} components={links} />
        ),
      }))}
    />
  )
}
