import { Trans, useTranslation } from "@workspace/i18n/react"
import {
  FileCheck2Icon,
  FileTextIcon,
  HashIcon,
  ImageIcon,
  MailIcon,
  SmartphoneIcon,
} from "lucide-react"

import { ReadyGrid } from "@/components/guide/ready-grid"

import { useGuideLinks } from "../hooks/use-guide-links"
import { READY_ANCHOR, READY_ITEMS } from "../lib/chapters"

const ICONS = {
  email: MailIcon,
  mobile: SmartphoneIcon,
  numbers: HashIcon,
  documents: FileCheck2Icon,
  logo: ImageIcon,
  jd: FileTextIcon,
} as const

export function KeepReady() {
  const { t } = useTranslation("employerGuide")
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
