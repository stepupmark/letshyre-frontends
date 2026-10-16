import { useTranslation } from "@workspace/i18n/react"

import { GuideToc } from "@/components/guide-toc"

import {
  PHASES,
  PRIVACY_ANCHOR,
  REQUIREMENTS_ANCHOR,
  STEP_ANCHORS,
} from "../lib/sections"

export function InterviewToc({ active }: { active?: string }) {
  const { t } = useTranslation("interview")

  const groups = [
    {
      items: [{ anchor: REQUIREMENTS_ANCHOR, label: t("requirements.title") }],
    },
    ...PHASES.map((phase) => ({
      title: t(`phases.${phase.id}`),
      items: phase.steps.map((id) => ({
        anchor: STEP_ANCHORS[id],
        label: t(`steps.${id}.title`),
      })),
    })),
    { items: [{ anchor: PRIVACY_ANCHOR, label: t("privacy.title") }] },
  ]

  return <GuideToc label={t("toc.label")} groups={groups} active={active} />
}
