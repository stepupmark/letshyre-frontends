import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"

import { HomeHeading } from "./home-heading"
import { CtaLink, TextLink } from "./home-links"
import { HomeSection } from "./home-section"

interface Interview {
  label: string
  role: string
}

const TILTS = ["-rotate-3", "rotate-1", "rotate-3"]

export function ForProfessionals() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const interviews = t("professionals.interviews", {
    returnObjects: true,
  }) as Interview[]
  const points = t("professionals.points", { returnObjects: true })

  return (
    <HomeSection
      id="for-professionals"
      muted
      className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"
    >
      <div className="reveal">
        <HomeHeading
          id="for-professionals-title"
          eyebrow={t("professionals.eyebrow")}
          title={t("professionals.title")}
          accent={t("professionals.accent")}
          description={t("professionals.description")}
        />
        <ul className="mt-8 flex flex-col gap-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3">
              <CheckIcon
                aria-hidden
                className="mt-1 size-4 shrink-0 text-brand-text"
              />
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.candidateRegister}>
            {t("professionals.cta")}
          </CtaLink>
          <TextLink to={localePath(lang, "/interview-guide")}>
            {t("professionals.guide")}
          </TextLink>
          <TextLink to={localePath(lang, "/download")}>
            {t("professionals.download")}
          </TextLink>
        </div>
      </div>

      <ol className="reveal mx-auto flex w-full max-w-md flex-col gap-4 lg:me-0">
        {interviews.map((interview, index) => (
          <li
            key={interview.label}
            className={cn(
              "flex items-center justify-between gap-4 rounded-2xl border bg-card p-5",
              TILTS[index]
            )}
          >
            <div>
              <p className="font-display text-2xl">{interview.label}</p>
              <p className="text-sm text-muted-foreground">{interview.role}</p>
            </div>
            <span className="rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand-text">
              {t("professionals.scorecard")}
            </span>
          </li>
        ))}
      </ol>
    </HomeSection>
  )
}
