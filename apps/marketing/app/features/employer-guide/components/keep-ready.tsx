import { Trans, useTranslation } from "@workspace/i18n/react"
import {
  FileCheck2Icon,
  FileTextIcon,
  HashIcon,
  ImageIcon,
  MailIcon,
  SmartphoneIcon,
} from "lucide-react"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"

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
  const titleId = useId()

  return (
    <Section
      id={READY_ANCHOR}
      aria-labelledby={titleId}
      className="scroll-mt-24 border-b py-12 sm:py-16"
    >
      <SectionHeader
        id={titleId}
        title={<span className="text-brand-text">{t("ready.title")}</span>}
        description={t("ready.description")}
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {READY_ITEMS.map((id) => {
          const Icon = ICONS[id]
          return (
            <li
              key={id}
              className="reveal group/item flex gap-4 rounded-2xl border p-5 transition-colors hover:border-brand/40"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand-text transition-transform duration-200 group-hover/item:-translate-y-0.5 motion-reduce:transition-none">
                <Icon aria-hidden className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold tracking-tight">
                  {t(`ready.items.${id}.title`)}
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  <Trans
                    t={t}
                    i18nKey={`ready.items.${id}.desc`}
                    components={links}
                  />
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
