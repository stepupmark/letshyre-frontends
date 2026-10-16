import { Trans, useTranslation } from "@workspace/i18n/react"
import type { ReactNode } from "react"

import { GuideChapter } from "@/components/guide/guide-chapter"

import { useGuideLinks } from "../hooks/use-guide-links"
import {
  CHAPTER_ANCHORS,
  CHAPTER_STEPS,
  CHAPTERS,
  type ChapterId,
} from "../lib/chapters"
import { Scene } from "./art/scene"

type StepId = (typeof CHAPTER_STEPS)[ChapterId][number]

export function Chapter({
  id,
  children,
}: {
  id: ChapterId
  children?: ReactNode
}) {
  const { t } = useTranslation("employerGuide")
  const links = useGuideLinks()
  const number = CHAPTERS.indexOf(id) + 1
  const steps: readonly StepId[] = CHAPTER_STEPS[id]

  return (
    <GuideChapter
      anchor={CHAPTER_ANCHORS[id]}
      number={number}
      eyebrow={t("chapter", { number })}
      title={t(`chapters.${id}.title`)}
      lead={t(`chapters.${id}.lead`)}
      steps={steps.map((step) => ({
        id: step,
        title: t(`steps.${step}.title`),
        body: <Trans t={t} i18nKey={`steps.${step}.body`} components={links} />,
      }))}
      scene={<Scene chapter={id} />}
      noteLabel={t("goodToKnow")}
      note={<Trans t={t} i18nKey={`chapters.${id}.note`} components={links} />}
    >
      {children}
    </GuideChapter>
  )
}
