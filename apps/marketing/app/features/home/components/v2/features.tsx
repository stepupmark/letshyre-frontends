import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { Band } from "@/components/band"
import { CtaLink, TextLink } from "@/components/cta-links"
import { PAGES } from "@/lib/pages"

import { Heading } from "./heading"
import { ScorecardScene } from "./scenes/scorecard-scene"
import { ShortlistScene } from "./scenes/shortlist-scene"
import { UnlockScene } from "./scenes/unlock-scene"
import { Step } from "./step"

export function Features() {
  const { t } = useTranslation("homeV2")
  const lang = useLocale()
  const copy = (key: "shortlist" | "evidence" | "unlock") => ({
    id: key,
    eyebrow: t(`${key}.eyebrow`),
    title: t(`${key}.title`),
    accent: t(`${key}.accent`),
    body: t(`${key}.body`),
    points: t(`${key}.points`, { returnObjects: true }),
  })

  return (
    <Band id="how" muted>
      <Heading
        id="how-title"
        eyebrow={t("how.eyebrow")}
        title={t("how.title")}
        accent={t("how.accent")}
        className="slide-in"
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <Step step={1} {...copy("shortlist")} scene={<ShortlistScene />} wide />
        <Step step={2} {...copy("evidence")} scene={<ScorecardScene />} />
        <Step
          step={3}
          {...copy("unlock")}
          scene={<UnlockScene />}
          actions={
            <>
              <CtaLink href={APP_LINKS.employerRegister}>
                {t("unlock.cta")}
                <ArrowRightIcon aria-hidden />
              </CtaLink>
              <TextLink to={localePath(lang, PAGES.pricing.path)}>
                {t("unlock.pricing")}
              </TextLink>
            </>
          }
        />
      </div>
    </Band>
  )
}
