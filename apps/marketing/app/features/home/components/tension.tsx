import { useTranslation } from "@workspace/i18n/react"

import { ClaimVsEvidence } from "./art/claim-vs-evidence"
import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"
import { type Side, SideBySide } from "./side-by-side"

export function Tension() {
  const { t } = useTranslation("home")
  const sides = [
    t("tension.employer", { returnObjects: true }),
    t("tension.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <HomeSection
      id="tension"
      muted
      className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-20"
    >
      <div className="slide-in">
        <HomeHeading
          id="tension-title"
          eyebrow={t("tension.eyebrow")}
          title={t("tension.title")}
          accent={t("tension.accent")}
        />
        <SideBySide sides={sides} className="mt-10" />
      </div>

      <ClaimVsEvidence />
    </HomeSection>
  )
}
