import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { CheckIcon } from "lucide-react"

import { usePublished } from "@/hooks/use-published"
import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

import { AttemptTracker } from "./art/attempt-tracker"
import { FreshPool } from "./fresh-pool"
import { HomeHeading } from "./home-heading"
import { CtaLink, TextLink } from "./home-links"
import { HomeSection } from "./home-section"

export function ForProfessionals() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const published = usePublished()
  const guide = localePath(
    lang,
    (published("candidateGuide") ? PAGES.candidateGuide : PAGES.interview).path
  )
  const points = t("professionals.points", { returnObjects: true })

  return (
    <HomeSection
      id="for-professionals"
      className="flex flex-col gap-16 sm:gap-20"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="slide-in">
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
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
                  <CheckIcon aria-hidden className="size-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CtaLink href={APP_LINKS.candidateRegister}>
              {t("professionals.cta")}
            </CtaLink>
            <TextLink to={guide}>{t("professionals.guide")}</TextLink>
            <TextLink to={localePath(lang, "/download")}>
              {t("professionals.download")}
            </TextLink>
          </div>
        </div>

        <AttemptTracker className="lg:order-first" />
      </div>

      <FreshPool />
    </HomeSection>
  )
}
