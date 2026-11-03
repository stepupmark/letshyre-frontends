import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { BriefcaseBusinessIcon, UserRoundIcon } from "lucide-react"
import type { ReactNode } from "react"

import { BandHeading } from "@/components/band-heading"
import { TextLink } from "@/components/cta-links"
import { Band } from "@/components/band"
import { PAGES } from "@/lib/pages"

interface Step {
  title: string
  body: string
}

// the unlock step is the only one an employer pays for
const PAID_STEP = 3

export function HowItWorks() {
  const { t } = useTranslation(["home", "homeV2"])
  const lang = useLocale()

  return (
    <Band id="how-it-works">
      <BandHeading
        id="how-it-works-title"
        eyebrow={t("home:how.eyebrow")}
        title={t("home:how.title")}
        accent={t("home:how.accent")}
        className="slide-in"
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Side
          icon={<BriefcaseBusinessIcon aria-hidden className="size-4" />}
          title={t("homeV2:how.employers")}
          steps={t("home:how.employerSteps", { returnObjects: true })}
          note={[PAID_STEP, t("home:how.employerNote")]}
          link={
            <TextLink to={localePath(lang, PAGES.employerGuide.path)}>
              {t("home:how.employerGuide")}
            </TextLink>
          }
        />
        <Side
          icon={<UserRoundIcon aria-hidden className="size-4" />}
          title={t("homeV2:how.professionals")}
          steps={t("home:how.professionalSteps", { returnObjects: true })}
          tag={t("home:how.professionalNote")}
          link={
            <TextLink to={localePath(lang, PAGES.candidateGuide.path)}>
              {t("home:professionals.guide")}
            </TextLink>
          }
        />
      </div>
    </Band>
  )
}

function Side({
  icon,
  title,
  steps,
  note,
  tag,
  link,
}: {
  icon: ReactNode
  title: string
  steps: readonly Step[]
  note?: readonly [step: number, text: string]
  tag?: string
  link: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="slide-in flex flex-col rounded-2xl border p-6 sm:p-8"
    >
      <h3 className="flex flex-wrap items-center gap-2 font-semibold text-brand-text">
        {icon}
        {title}
        {tag && (
          <span className="ms-auto rounded-full bg-brand-muted px-2.5 py-0.5 text-xs font-medium">
            {tag}
          </span>
        )}
      </h3>
      <ol className="mt-6 flex flex-col">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute inset-s-3.5 top-8 bottom-1 w-px bg-border"
              />
            )}
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold tabular-nums">
              {index + 1}
            </span>
            <div className="pt-0.5">
              <p className="flex flex-wrap items-center gap-x-2 font-medium">
                {step.title}
                {note?.[0] === index && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {note[1]}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-6">{link}</div>
    </section>
  )
}
