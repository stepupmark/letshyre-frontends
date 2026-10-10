import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import {
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  Mic,
  type LucideIcon,
} from "lucide-react"

import type { Audience } from "../audience"

import { ScoreCard, type Person } from "./score-card"

const LEAD = { clarity: 84, depth: 71, fit: 78 }
const SCORES = [84, 79, 76] as const
const STEP_ICONS: LucideIcon[] = [Mic, ClipboardCheck, BriefcaseBusiness]

type Side = Audience | "general"

function usePeople() {
  const { t } = useTranslation("auth")
  return t("art.people", { returnObjects: true }) as Person[]
}

/** The larger half of the auth screens from lg up: what this side gets, shown. */
export function AuthArt({ side }: { side: Side }) {
  const { t } = useTranslation("auth")

  return (
    <figure
      aria-hidden="true"
      className="short:gap-6 @container flex w-full max-w-lg flex-col gap-10"
    >
      {side === "employer" ? (
        <EmployerStack />
      ) : side === "candidate" ? (
        <CandidatePath />
      ) : (
        <GeneralCard />
      )}
      <figcaption className="settle flex flex-col gap-3 delay-300">
        <span className="font-script -rotate-2 text-4xl leading-none text-brand-text @md:text-5xl">
          {t(`art.${side}.note`)}
        </span>
        <span className="font-display short:text-3xl text-3xl/tight text-balance @md:text-4xl">
          {t(`art.${side}.tagline`)}
        </span>
      </figcaption>
    </figure>
  )
}

function EmployerStack() {
  const [first, second, third] = usePeople()
  if (!first || !second || !third) return null

  return (
    <div className="short:pt-8 grid pt-12 *:col-start-1 *:row-start-1">
      <ScoreCard
        person={third}
        score={SCORES[2]}
        className="settle short:-translate-y-8 translate-x-10 -translate-y-12 rotate-6 opacity-70 rtl:-translate-x-10 rtl:-rotate-6"
      />
      <ScoreCard
        person={second}
        score={SCORES[1]}
        className="settle short:-translate-y-4 translate-x-5 -translate-y-6 rotate-3 delay-75 rtl:-translate-x-5 rtl:-rotate-3"
      />
      <ScoreCard
        person={first}
        score={SCORES[0]}
        bars={LEAD}
        className="settle -rotate-1 delay-150 rtl:rotate-1"
      />
    </div>
  )
}

function CandidatePath() {
  const { t } = useTranslation("auth")
  const steps = t("art.candidate.steps", { returnObjects: true }) as {
    title: string
    meta: string
  }[]

  return (
    <ol className="short:gap-3 relative flex flex-col gap-4">
      <span className="absolute inset-y-8 inset-s-9 w-px bg-border" />
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[index] ?? Check
        const last = index === steps.length - 1
        return (
          <li
            key={step.title}
            className={cn(
              "settle relative flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-lg",
              index === 0 && "-rotate-1 rtl:rotate-1",
              index === 1 &&
                "translate-x-4 rotate-1 delay-75 rtl:-translate-x-4 rtl:-rotate-1",
              last && "-rotate-1 delay-150 rtl:rotate-1"
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
              <Icon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{step.title}</span>
              <span className="text-sm text-muted-foreground">{step.meta}</span>
            </span>
            {last ? (
              <span className="rounded-full bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-text">
                {t("art.candidate.new")}
              </span>
            ) : (
              <Check className="size-5 shrink-0 text-brand-text" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function GeneralCard() {
  const [first] = usePeople()
  if (!first) return null

  return (
    <ScoreCard
      person={first}
      score={SCORES[0]}
      bars={LEAD}
      className="settle -rotate-2 rtl:rotate-2"
    />
  )
}

/** The same idea in a slim band above the form, below lg. */
export function AuthStrip({ side }: { side: Side }) {
  const { t } = useTranslation("auth")
  const [first, second] = usePeople()

  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 overflow-hidden rounded-2xl bg-muted/60 px-4 py-5 sm:gap-6 sm:px-6 lg:hidden [@media(max-height:500px)]:hidden"
    >
      {side === "candidate" ? (
        <ol className="flex shrink-0 items-center gap-1.5">
          {STEP_ICONS.map((Icon, index) => (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <span className="h-px w-3 bg-border sm:w-5" />}
              <span className="relative flex size-9 items-center justify-center rounded-full border bg-card text-brand-text sm:size-11">
                <Icon className="size-4 sm:size-5" />
                {index < 2 && (
                  <Check className="absolute -inset-e-1 -top-1 size-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                )}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        first && (
          <span className="flex shrink-0">
            <ScoreCard
              person={first}
              score={SCORES[0]}
              compact
              className="settle -rotate-3 rtl:rotate-3"
            />
            {second && side === "employer" && (
              <ScoreCard
                person={second}
                score={SCORES[1]}
                compact
                className="settle -ms-24 mt-3 hidden rotate-2 delay-75 sm:block rtl:-rotate-2"
              />
            )}
          </span>
        )
      )}
      <span className="font-script -rotate-3 text-2xl/tight text-brand-text sm:text-3xl">
        {t(`art.${side}.note`)}
      </span>
    </div>
  )
}
