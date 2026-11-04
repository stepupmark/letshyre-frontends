import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"

import { Container } from "@/components/section"

import { FileCard } from "./file-card"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"

export function CandidateFile() {
  const titleId = useId()

  return (
    <ScrollScene screens={3} pinFrom="md" aria-labelledby={titleId}>
      <Container className="grid h-full items-center gap-12 py-16 md:grid-cols-2 md:pt-24">
        <FileCopy titleId={titleId} />
        <FileCard />
      </Container>
    </ScrollScene>
  )
}

function FileCopy({ titleId }: { titleId: string }) {
  const { t } = useTranslation("homeV3")
  const { progress, still } = useScene()
  const before = useTransform(progress, [0.62, 0.7], [1, 0])
  const after = useTransform(progress, [0.62, 0.7], [0, 1])

  return (
    <div>
      <p className="text-sm font-semibold text-brand-text">
        {t("file.eyebrow")}
      </p>
      <h2
        id={titleId}
        className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
      >
        {t("file.title")}{" "}
        <span className="text-brand-text">{t("file.accent")}</span>
      </h2>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground sm:text-lg">
        {t("file.description")}
      </p>
      <dl className="mt-10 grid max-w-md gap-6 border-t pt-6">
        <div>
          <dt className="flex items-center gap-2 font-semibold">
            <Marker opacity={still ? undefined : before} />
            {t("file.visible")}
          </dt>
          <dd className="ms-4.5 mt-1 text-pretty text-muted-foreground">
            {t("file.visibleBody")}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 font-semibold">
            <Marker opacity={still ? undefined : after} />
            {t("file.included")}
          </dt>
          <dd className="ms-4.5 mt-1 text-pretty text-muted-foreground">
            {t("file.includedBody")}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function Marker({ opacity }: { opacity: MotionValue<number> | undefined }) {
  return (
    <span aria-hidden className="grid size-2.5 rounded-full bg-muted">
      <m.span style={{ opacity }} className="rounded-full bg-brand" />
    </span>
  )
}
