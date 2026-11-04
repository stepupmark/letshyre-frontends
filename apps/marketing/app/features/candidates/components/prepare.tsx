import { useTranslation } from "@workspace/i18n/react"
import {
  CodeIcon,
  ListChecksIcon,
  AudioLinesIcon,
  PenLineIcon,
} from "lucide-react"

import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"
import { TextLink } from "@/components/cta-links"
import { usePagePath } from "@/hooks/use-page-path"

interface Type {
  title: string
  body: string
}

const ICONS = [ListChecksIcon, CodeIcon, PenLineIcon, AudioLinesIcon]

export function Prepare() {
  const { t } = useTranslation("candidates")
  const pagePath = usePagePath()
  const types = t("prepare.types", { returnObjects: true }) as Type[]

  return (
    <Band id="prepare">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <BandHeading
          id="prepare-title"
          className="slide-in"
          eyebrow={t("prepare.eyebrow")}
          title={t("prepare.title")}
          accent={t("prepare.accent")}
          description={t("prepare.description")}
        />
        <TextLink to={pagePath("interview")}>{t("prepare.guide")}</TextLink>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {types.map((type, i) => {
          const Icon = ICONS[i] ?? ListChecksIcon
          return (
            <li
              key={type.title}
              className="group reveal flex flex-col rounded-3xl border bg-card p-6 transition-colors hover:border-brand/30"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand-text transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">
                {type.title}
              </h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                {type.body}
              </p>
            </li>
          )
        })}
      </ul>
    </Band>
  )
}
