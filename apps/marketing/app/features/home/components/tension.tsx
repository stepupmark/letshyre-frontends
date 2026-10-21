import { useTranslation } from "@workspace/i18n/react"

import { ClaimVsEvidence } from "./art/claim-vs-evidence"
import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"
import { type Side, SideBySide } from "./side-by-side"

export function Tension() {
  const { t } = useTranslation("home")
  const sides = [
    t("tension.employer", { returnObjects: true }),
    t("tension.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <Band
      id="tension"
      muted
      className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-20"
    >
      <div className="slide-in">
        <BandHeading
          id="tension-title"
          eyebrow={t("tension.eyebrow")}
          title={t("tension.title")}
          accent={t("tension.accent")}
        />
        <SideBySide sides={sides} className="mt-10" />
      </div>

      <ClaimVsEvidence />
    </Band>
  )
}
