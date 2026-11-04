import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { useState } from "react"

import { usePagePath } from "@/hooks/use-page-path"
import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"
import { BandHeading } from "@/components/band-heading"
import { TextLink } from "@/components/cta-links"
import { Band } from "@/components/band"

import { type Side, type Step, StepExplorer } from "./step-explorer"

// where the two journeys meet: the employer's review (step 3) reads the professional's scorecard (step 4)
const MEETING = { employers: 2, professionals: 3 }

/** The chosen side and each side's step; following the bridge lands on the other side's matching step. */
function useExplorer() {
  const [side, setSide] = useState<Side>("employers")
  const [steps, setSteps] = useState({ employers: 0, professionals: 0 })

  const setStep = (of: Side, step: number) => {
    setSteps((current) => ({ ...current, [of]: step }))
  }

  const cross = (from: Side) => {
    const to = from === "employers" ? "professionals" : "employers"
    setStep(to, MEETING[to])
    setSide(to)
    requestAnimationFrame(() => {
      document.getElementById(`how-${to}-step-${MEETING[to] + 1}`)?.focus()
    })
  }

  return { side, setSide, steps, setStep, cross }
}

export function HowItWorks() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const published = usePublished()
  const explorer = useExplorer()
  const pagePath = usePagePath()
  const tracks = [
    {
      value: "employers" as const,
      label: t("how.employers"),
      steps: t("how.employerSteps", { returnObjects: true }) as Step[],
      note: { text: t("how.employerNote"), step: 3 },
      bridge: { step: MEETING.employers, label: t("how.bridge.employers") },
      guide: published("employerGuide") && {
        to: localePath(lang, PAGES.employerGuide.path),
        label: t("how.employerGuide"),
      },
    },
    {
      value: "professionals" as const,
      label: t("how.professionals"),
      steps: t("how.professionalSteps", { returnObjects: true }) as Step[],
      note: { text: t("how.professionalNote"), step: 0 },
      bridge: {
        step: MEETING.professionals,
        label: t("how.bridge.professionals"),
      },
      guide: {
        to: pagePath("interview"),
        label: t("professionals.guide"),
      },
    },
  ]

  return (
    <Band id="how-it-works">
      <BandHeading
        id="how-it-works-title"
        eyebrow={t("how.eyebrow")}
        title={t("how.title")}
        accent={t("how.accent")}
        className="slide-in"
      />

      <Tabs
        value={explorer.side}
        onValueChange={(value) => {
          explorer.setSide(value as Side)
        }}
        className="mt-8 gap-0"
      >
        <TabsList
          aria-label={t("how.tabsLabel")}
          className="h-12! rounded-full border bg-muted/60 p-1"
        >
          {tracks.map((track) => (
            <TabsTrigger
              key={track.value}
              value={track.value}
              className="rounded-full px-5 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
            >
              {track.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tracks.map((track) => (
          <TabsContent
            key={track.value}
            value={track.value}
            keepMounted
            className="mt-6"
          >
            <StepExplorer
              side={track.value}
              label={track.label}
              steps={track.steps}
              note={track.note}
              bridge={{
                ...track.bridge,
                onFollow: () => {
                  explorer.cross(track.value)
                },
              }}
              active={explorer.steps[track.value]}
              onActive={(step) => {
                explorer.setStep(track.value, step)
              }}
            />
            {track.guide && (
              <TextLink to={track.guide.to} className="mt-8">
                {track.guide.label}
              </TextLink>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Band>
  )
}
