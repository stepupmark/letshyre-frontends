import { Button } from "@workspace/ui/components/button"
import { useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { PageHeader } from "@/components/page-header"
import { StatusBadge, type Tone } from "@/components/status-badge"
import { duration } from "@/lib/motion"

export function meta() {
  return [{ title: "Design lab · LetsHyre" }]
}

const screens = [
  {
    to: "/_lab/dashboard",
    title: "Employer dashboard",
    detail:
      "What needs attention, open jobs, credits; setup checklist for new accounts.",
  },
  {
    to: "/_lab/applicants",
    title: "Applicants",
    detail:
      "Dense table, peek panel, bulk actions with undo, keyboard review, unlock.",
  },
  {
    to: "/_lab/scorecard",
    title: "Scorecard",
    detail: "Score with reasons, answers with evidence, recording timestamps.",
  },
  {
    to: "/_lab/blocks",
    title: "Building blocks",
    detail: "Data table, detail sheet, upload, wizard and the smaller pieces.",
  },
]

const tones: Tone[] = ["success", "warning", "danger", "info", "neutral"]

export default function LabIndex() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Design lab"
        description="Coded prototypes for step 5.0. Fixture data, no API. Not part of the production build."
      />

      <section aria-labelledby="screens">
        <h2 id="screens" className="mb-3 text-base font-medium">
          Screens
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {screens.map((s) => (
            <li key={s.to}>
              <Link
                to={s.to}
                viewTransition
                className="flex h-full flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <span className="font-medium">{s.title}</span>
                <span className="text-sm text-muted-foreground">
                  {s.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="checks" className="flex flex-col gap-6">
        <h2 id="checks" className="text-base font-medium">
          Checks
        </h2>
        <NumeralsCheck />
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Status colours</h3>
          <div className="flex flex-wrap gap-2">
            {tones.map((tone) => (
              <StatusBadge key={tone} tone={tone}>
                {tone}
              </StatusBadge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Each pair is held to 4.5:1 contrast by a unit test.
          </p>
        </div>
        <MotionCheck />
      </section>
    </div>
  )
}

function NumeralsCheck() {
  const ones = useRef<HTMLSpanElement>(null)
  const zeros = useRef<HTMLSpanElement>(null)
  const [widths, setWidths] = useState<[number, number] | null>(null)

  useEffect(() => {
    void document.fonts.ready.then(() => {
      if (ones.current && zeros.current) {
        setWidths([
          ones.current.getBoundingClientRect().width,
          zeros.current.getBoundingClientRect().width,
        ])
      }
    })
  }, [])

  const tabular = widths !== null && Math.abs(widths[0] - widths[1]) < 0.5

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Tabular numerals in Outfit (D10)</h3>
      <div className="flex flex-col gap-1 font-sans text-lg tabular-nums">
        <span ref={ones} className="w-fit">
          111111
        </span>
        <span ref={zeros} className="w-fit">
          000000
        </span>
      </div>
      <p className="text-sm text-muted-foreground" data-testid="numerals">
        {widths === null
          ? "Measuring…"
          : tabular
            ? "Pass: digits share one width, so columns line up."
            : `Fail: "111111" is ${widths[0].toFixed(1)}px and "000000" is ${widths[1].toFixed(1)}px with tabular-nums on.`}
      </p>
    </div>
  )
}

function MotionCheck() {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(24)

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Motion</h3>
      <p className="text-sm text-muted-foreground">
        Tokens: fast {duration.fast * 1000} ms, base {duration.base * 1000} ms,
        slow {duration.slow * 1000} ms. Reduced motion is{" "}
        {reduce ? "on: values jump" : "off"}.
      </p>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold">
          <AnimatedNumber value={value} />
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setValue((v) => v - 2)
          }}
        >
          Spend 2
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setValue((v) => v + 20)
          }}
        >
          Add 20
        </Button>
      </div>
    </div>
  )
}
