import { useTranslation } from "@workspace/i18n/react"

import { AudienceCtas } from "./audience-ctas"
import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"

export function FinalCta() {
  const { t } = useTranslation("home")

  return (
    <HomeSection id="final" className="reveal">
      <HomeHeading
        id="final-title"
        title={t("final.title")}
        accent={t("final.accent")}
        description={t("final.description")}
        center
      />
      <AudienceCtas className="mt-8 justify-center" />
    </HomeSection>
  )
}
