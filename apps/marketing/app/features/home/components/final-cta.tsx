import { useTranslation } from "@workspace/i18n/react"

import { AudienceCtas } from "./audience-ctas"
import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"

export function FinalCta() {
  const { t } = useTranslation("home")

  return (
    <HomeSection id="final" flushTop>
      <div className="reveal rounded-3xl border border-brand/20 bg-brand-muted px-6 py-14 sm:px-12 sm:py-20">
        <HomeHeading
          id="final-title"
          title={t("final.title")}
          accent={t("final.accent")}
          center
        />
        <p className="mx-auto mt-5 max-w-xl text-center text-lg text-pretty text-foreground/75">
          {t("final.description")}
        </p>
        <AudienceCtas className="mt-10 justify-center" />
      </div>
    </HomeSection>
  )
}
