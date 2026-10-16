import { useTranslation } from "@workspace/i18n/react"

import { FileAnatomy } from "./art/file-anatomy"
import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"

export function Evidence() {
  const { t } = useTranslation("home")

  return (
    <HomeSection
      id="evidence"
      muted
      className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20"
    >
      <HomeHeading
        id="evidence-title"
        eyebrow={t("evidence.eyebrow")}
        title={t("evidence.title")}
        accent={t("evidence.accent")}
        description={t("evidence.description")}
        className="slide-in"
      />
      <FileAnatomy />
    </HomeSection>
  )
}
