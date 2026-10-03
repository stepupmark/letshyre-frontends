import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/section"

import { AboutIntro } from "./components/about-intro"
import { Audiences } from "./components/audiences"
import { Disclaimer } from "./components/disclaimer"
import { MissionVision } from "./components/mission-vision"
import { ProfileDuration } from "./components/profile-duration"
import { WhyLetsHyre } from "./components/why-letshyre"
import { plainText } from "@/lib/plain-text"

export function AboutPage() {
  const { t } = useTranslation("about")

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={plainText(t("hero.title"))}
        description={t("hero.description")}
      />
      <AboutIntro />
      <MissionVision />
      <Audiences />
      <WhyLetsHyre />
      <ProfileDuration />
      <Disclaimer />
    </>
  )
}
