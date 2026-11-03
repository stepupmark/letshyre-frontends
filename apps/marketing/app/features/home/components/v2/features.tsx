import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { CtaLink, TextLink } from "@/components/cta-links"
import { PAGES } from "@/lib/pages"

import { FeatureRow } from "./feature-row"
import { InterviewScene } from "./scenes/interview-scene"
import { ScorecardScene } from "./scenes/scorecard-scene"
import { ShortlistScene } from "./scenes/shortlist-scene"
import { UnlockScene } from "./scenes/unlock-scene"

export function Features() {
  const { t } = useTranslation("homeV2")
  const lang = useLocale()
  const copy = (
    key: "shortlist" | "evidence" | "unlock" | "professionals"
  ) => ({
    id: key,
    eyebrow: t(`${key}.eyebrow`),
    title: t(`${key}.title`),
    accent: t(`${key}.accent`),
    body: t(`${key}.body`),
    points: t(`${key}.points`, { returnObjects: true }),
  })

  return (
    <>
      <FeatureRow {...copy("shortlist")} scene={<ShortlistScene />} />
      <FeatureRow {...copy("evidence")} scene={<ScorecardScene />} flip muted />
      <FeatureRow
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
      <FeatureRow
        {...copy("professionals")}
        scene={<InterviewScene />}
        flip
        muted
        actions={
          <>
            <CtaLink href={APP_LINKS.candidateRegister}>
              {t("professionals.cta")}
            </CtaLink>
            <TextLink to={localePath(lang, PAGES.download.path)}>
              {t("professionals.download")}
            </TextLink>
          </>
        }
      />
    </>
  )
}
