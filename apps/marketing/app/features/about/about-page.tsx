import { Trans, useTranslation } from "@workspace/i18n/react"

import { CtaBand } from "@/components/cta-band"
import { HIGHLIGHT } from "@/components/highlight"
import { PageHeader } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { AboutFacts } from "./components/about-facts"
import { AboutIntro } from "./components/about-intro"
import { HireFlow } from "./components/art/hire-flow"
import { Audiences } from "./components/audiences"
import { ProfileDuration } from "./components/profile-duration"
import { WhyLetsHyre } from "./components/why-letshyre"

export function AboutPage() {
  const { t } = useTranslation("about")

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={<Trans t={t} i18nKey="hero.title" components={HIGHLIGHT} />}
        description={t("hero.description")}
        art={<HireFlow />}
      >
        <AboutFacts />
      </PageHeader>
      <AboutIntro />
      <Audiences />
      <WhyLetsHyre />
      <ProfileDuration />
      <CtaBand
        title={t("cta.title")}
        description={t("cta.description")}
        primary={{
          label: t("cta.startHiring"),
          href: APP_LINKS.employerRegister,
        }}
        secondary={{
          label: t("whatWeDo.candidatesLink"),
          href: APP_LINKS.candidateRegister,
        }}
      />
    </>
  )
}
