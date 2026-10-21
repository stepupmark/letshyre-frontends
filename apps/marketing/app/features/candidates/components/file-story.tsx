import { useTranslation } from "@workspace/i18n/react"

import { FileHead } from "@/components/art/file-head"
import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"
import { FileBuild } from "@/components/file-build"

import {
  InterviewsLayer,
  ProfileLayer,
  ResumeLayer,
  ScorecardLayer,
} from "./art/file-layers"

interface Step {
  title: string
  body: string
}

const LAYERS = [
  <ProfileLayer key="profile" />,
  <ResumeLayer key="resume" />,
  <InterviewsLayer key="interviews" />,
  <ScorecardLayer key="scorecard" />,
]

export function FileStory() {
  const { t } = useTranslation("candidates")
  const steps = t("build.steps", { returnObjects: true }) as Step[]

  return (
    <Band id="build">
      <BandHeading
        id="build-title"
        className="slide-in"
        eyebrow={t("build.eyebrow")}
        title={t("build.title")}
        accent={t("build.accent")}
        description={t("build.description")}
      />
      <div className="mt-14">
        <FileBuild
          id="candidate-file"
          steps={steps.map((step, i) => ({ ...step, layer: LAYERS[i] }))}
          head={
            <FileHead name={t("hero.card.name")} role={t("hero.card.role")} />
          }
          caption={t("build.caption")}
        />
      </div>
    </Band>
  )
}
