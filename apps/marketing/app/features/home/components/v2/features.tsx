import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import type { CSSProperties } from "react"

import { APP_LINKS } from "@/lib/app-links"
import { Band } from "@/components/band"
import { CtaLink, TextLink } from "@/components/cta-links"
import { PAGES } from "@/lib/pages"

import { Heading } from "./heading"
import { Photo } from "./photo"
import { EvidenceCard, ShortlistCard, UnlockCard } from "./scenes/step-cards"

const STEPS = [
  { key: "shortlist", photo: "post-a-job", Card: ShortlistCard },
  { key: "evidence", photo: "review-interview", Card: EvidenceCard },
  { key: "unlock", photo: "reach-out", Card: UnlockCard },
] as const

export function Features() {
  const { t } = useTranslation("homeV2")
  const lang = useLocale()

  return (
    <Band id="how">
      <Heading
        id="how-title"
        eyebrow={t("how.eyebrow")}
        title={t("how.title")}
        accent={t("how.accent")}
        className="slide-in"
      />

      <ol className="mt-14 grid gap-14 lg:grid-cols-3 lg:gap-8">
        {STEPS.map(({ key, photo, Card }, index) => (
          <li
            key={key}
            id={key}
            className="slide-in grid items-center gap-8 md:grid-cols-2 lg:flex lg:flex-col lg:items-stretch lg:gap-0"
          >
            <div className="relative">
              <Photo
                name={photo}
                alt={t(`${key}.photo`)}
                sizes="(min-width: 1152px) 352px, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, calc(100vw - 2rem)"
                portrait
              />
              <div
                className="drop-in absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4"
                style={{ "--i": index } as CSSProperties}
              >
                <Card />
              </div>
            </div>
            <div className="lg:mt-7">
              <p className="flex items-center gap-3 text-sm font-medium">
                <span className="text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="h-px w-6 bg-border" />
                <span className="text-brand-text">{t(`${key}.eyebrow`)}</span>
              </p>
              <h3
                id={`${key}-title`}
                className="mt-3 text-xl font-semibold tracking-tight text-balance sm:text-2xl"
              >
                {t(`${key}.title`)}{" "}
                <span className="text-muted-foreground">
                  {t(`${key}.accent`)}
                </span>
              </h3>
              <p className="mt-3 text-pretty text-muted-foreground">
                {t(`${key}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="slide-in mt-16 flex flex-col gap-6 border-t pt-8 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {t("unlock.points", { returnObjects: true }).map((point) => (
            <li key={point} className="flex items-center gap-2">
              <CheckIcon aria-hidden className="size-4 text-brand-text" />
              {point}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.employerRegister}>
            {t("unlock.cta")}
            <ArrowRightIcon aria-hidden />
          </CtaLink>
          <TextLink to={localePath(lang, PAGES.pricing.path)}>
            {t("unlock.pricing")}
          </TextLink>
        </div>
      </div>
    </Band>
  )
}
