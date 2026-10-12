import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import {
  CameraIcon,
  CheckIcon,
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
      className="scroll-mt-24 border-b py-12 sm:py-16"
    >
      <SectionHeader
        id={titleId}
        title={t("requirements.title")}
        description={t("requirements.description")}
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {REQUIREMENTS.map((id, i) => {
          const Icon = ICONS[id]
          return (
            <li
              key={id}
              className={cn(
                "reveal flex gap-4 rounded-2xl border p-5",
                i < 3 ? "lg:col-span-2" : "lg:col-span-3",
                i === REQUIREMENTS.length - 1 && "sm:max-lg:col-span-2"
              )}
            >
              <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-text">
                <Icon aria-hidden className="size-5" />
                <span
                  aria-hidden
                  className="pop-in absolute -inset-e-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
                >
                  <CheckIcon className="size-3" strokeWidth={3} />
                </span>
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold tracking-tight">
                  {t(`requirements.items.${id}.title`)}
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {t(`requirements.items.${id}.desc`)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
