import { useTranslation } from "@workspace/i18n/react"

import { FileHead } from "@/components/art/file-head"
import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"
import { FileBuild } from "@/components/file-build"

import {
  InterviewLayer,
  ProfileLayer,
  ScoreLayer,
  UnlockLayer,
} from "./art/file-layers"

interface Step {
  title: string
  body: string
}

export function FileStory() {
  const { t } = useTranslation("employers")
  const steps = t("build.steps", { returnObjects: true }) as Step[]
  const people = t("compare.people", { returnObjects: true })
  const layers = [
    <ProfileLayer key="profile" />,
    <InterviewLayer key="interview" />,
    <ScoreLayer key="score" />,
    <UnlockLayer key="unlock" people={people} />,
  ]

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
          id="employer-file"
          steps={steps.map((step, i) => ({ ...step, layer: layers[i] }))}
          head={
            <FileHead name={t("hero.file.name")} role={t("hero.file.role")} />
          }
          caption={t("build.caption")}
        />
      </div>
    </Band>
  )
}
