import { useTranslation } from "@workspace/i18n/react"
import { Card } from "@workspace/ui/components/card"
import {
  CameraIcon,
  LampDeskIcon,
  LaptopIcon,
  MicIcon,
  WifiIcon,
} from "lucide-react"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"

import { REQUIREMENTS, REQUIREMENTS_ANCHOR } from "../lib/sections"

const ICONS = {
  computer: LaptopIcon,
  camera: CameraIcon,
  microphone: MicIcon,
  internet: WifiIcon,
  room: LampDeskIcon,
} as const

export function BeforeYouStart() {
  const { t } = useTranslation("interview")
  const titleId = useId()

  return (
    <Section
      id={REQUIREMENTS_ANCHOR}
      aria-labelledby={titleId}
      className="scroll-mt-16 border-b py-10 sm:py-12"
    >
      <SectionHeader
        id={titleId}
        title={<span className="text-brand">{t("requirements.title")}</span>}
        description={t("requirements.description")}
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {REQUIREMENTS.map((id) => {
          const Icon = ICONS[id]
          return (
            <li key={id}>
              <Card className="h-full flex-row items-start gap-3 p-4 sm:flex-col">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="font-semibold">
                    {t(`requirements.items.${id}.title`)}
                  </h3>
                  <p className="text-sm text-pretty text-muted-foreground">
                    {t(`requirements.items.${id}.desc`)}
                  </p>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
