import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { useState } from "react"

import { usePublished } from "@/hooks/use-published"
import { PAGES } from "@/lib/pages"

import { HomeHeading } from "./home-heading"
import { TextLink } from "./home-links"
import { HomeSection } from "./home-section"
import { type Step, StepStory } from "./step-story"

type Side = "employers" | "professionals"

/** Switches side and lands on the matching step, so both halves of the process read as one. */
function useSideJump() {
  const [side, setSide] = useState<Side>("employers")

  const jump = (to: Side, step: number) => {
    setSide(to)
    const from = document.querySelector(`[id^="how-${side}-"]`)
    const target = document.getElementById(`how-${to}-${step}`)
    if (!from || !target) return

    // the old panel stays laid out for a frame or two; scrolling before it hides overshoots
    const land = (frames: number) => {
      if (from.checkVisibility() && frames > 0) {
        requestAnimationFrame(() => {
          land(frames - 1)
        })
        return
      }
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
      target.focus({ preventScroll: true })
    }
    land(10)
  }

  return { side, setSide, jump }
}

export function HowItWorks() {
  const { t } = useTranslation("home")
  const lang = useLocale()
  const published = usePublished()
  const { side, setSide, jump } = useSideJump()
  const candidateGuide = published("candidateGuide")
    ? PAGES.candidateGuide
    : PAGES.interview
  const tracks = [
    {
      value: "employers" as const,
      label: t("how.employers"),
      steps: t("how.employerSteps", { returnObjects: true }) as Step[],
      note: { text: t("how.employerNote"), step: 3 },
      bridge: {
        step: 2,
        label: t("how.bridge.employers"),
        onFollow: () => {
          jump("professionals", 4)
        },
      },
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
        step: 3,
        label: t("how.bridge.professionals"),
        onFollow: () => {
          jump("employers", 3)
        },
      },
      guide: {
        to: localePath(lang, candidateGuide.path),
        label: t("professionals.guide"),
      },
    },
  ]

  return (
    <HomeSection id="how-it-works">
      <Tabs
        value={side}
        onValueChange={(value) => {
          setSide(value as Side)
        }}
        className="gap-0"
      >
        <HomeHeading
          id="how-it-works-title"
          eyebrow={t("how.eyebrow")}
          title={t("how.title")}
          accent={t("how.accent")}
          className="slide-in"
        />
        <div className="sticky top-16 z-10 -mx-4 mt-8 bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-18 lg:-mx-8 lg:px-8">
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
        </div>

        {tracks.map((track) => (
          <TabsContent
            key={track.value}
            value={track.value}
            keepMounted
            className="mt-8"
          >
            <StepStory
              side={track.value}
              steps={track.steps}
              note={track.note}
              bridge={track.bridge}
            />
            {track.guide && (
              <TextLink to={track.guide.to} className="mt-10">
                {track.guide.label}
              </TextLink>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </HomeSection>
  )
}
