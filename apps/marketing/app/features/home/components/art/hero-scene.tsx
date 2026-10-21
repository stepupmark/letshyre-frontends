import { useTranslation } from "@workspace/i18n/react"
import { BadgeCheckIcon, CircleHelpIcon, HandshakeIcon } from "lucide-react"

import { wait } from "@/components/art/delay"

import { EvidenceCard } from "./evidence-card"
import { InterviewLens } from "./interview-lens"
import { ResumePile } from "./resume-pile"

/** The headline acted out: resume claims go through an AI interview and come out as evidence. */
export function HeroScene() {
  const { t } = useTranslation("home")

  return (
    <figure className="mx-auto w-full max-w-lg lg:me-0">
      <div
        aria-hidden
        className="relative flex flex-col items-center gap-4 sm:block sm:aspect-4/5"
      >
        {/* Coordinates assume the stage's 4:5 box; the pieces below sit at matching percentages. */}
        <svg
          viewBox="0 0 400 500"
          fill="none"
          className="absolute inset-0 size-full text-brand max-sm:hidden rtl:-scale-x-100"
        >
          <path
            pathLength={1}
            d="M96 186C96 236 128 250 168 240M160.5 237.1 168 240l-5.3 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ink"
            style={wait(400)}
          />
          <path
            pathLength={1}
            d="M372 318C384 350 372 372 336 386M340.4 379.4 336 386l7.8 1.9"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ink"
            style={wait(1200)}
          />
        </svg>

        <span
          className="pop inline-flex items-center gap-1.5 self-start text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:absolute sm:inset-s-3 sm:top-0"
          style={wait(200)}
        >
          <CircleHelpIcon className="size-4" />
          {t("hero.scene.hope")}
        </span>
        <ResumePile className="rise w-3/4 sm:absolute sm:inset-s-1/50 sm:top-1/20 sm:w-1/2" />

        <span className="h-5 border-s-2 border-dashed border-brand/60 sm:hidden" />
        <InterviewLens
          className="pop w-11/12 sm:absolute sm:inset-e-0 sm:top-21/100 sm:w-14/25"
          style={wait(700)}
        />
        <span className="h-5 border-s-2 border-dashed border-brand/60 sm:hidden" />

        <div className="relative flex w-full flex-col items-center gap-4 sm:absolute sm:inset-s-1/25 sm:bottom-6 sm:block sm:w-39/50">
          <span
            className="pop inline-flex items-center gap-1.5 self-start text-xs font-semibold tracking-wider text-brand-text uppercase sm:absolute sm:inset-s-2 sm:-top-7"
            style={wait(1400)}
          >
            <BadgeCheckIcon className="size-4" />
            {t("hero.scene.evidence")}
          </span>
          <EvidenceCard className="rise w-full" style={wait(1300)} />
          <span
            className="pop inline-flex -rotate-8 items-center gap-2 self-end rounded-lg border-3 border-double border-brand bg-background px-3 py-1.5 text-xs font-bold tracking-widest text-brand-text uppercase max-sm:-mt-8 sm:absolute sm:-inset-e-16 sm:-bottom-4 rtl:rotate-8"
            style={wait(2300)}
          >
            <HandshakeIcon className="size-4" />
            {t("hero.scene.verdict")}
          </span>
        </div>
      </div>

      <figcaption className="mt-8 text-center text-xs text-muted-foreground">
        {t("hero.file.caption")}
        <span className="sr-only">{t("hero.scene.description")}</span>
      </figcaption>
    </figure>
  )
}
