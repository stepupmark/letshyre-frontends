import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ChevronDown, Link2, Play, Printer } from "lucide-react"
import * as m from "motion/react-m"
import { toast } from "sonner"

import { LoadError } from "./load-error"
import { PageHeader } from "@/components/page-header"
import { ScoreBand } from "./score-band"
import { StatusBadge } from "@/components/status-badge"
import { useDelayed } from "@/hooks/use-delayed"
import { duration, ease } from "@/lib/motion"

import { scorecard } from "./fixtures"
import { useLab } from "./use-lab"

export function meta() {
  return [{ title: `${scorecard.candidate_name} · Scorecard · LetsHyre` }]
}

export default function Scorecard() {
  const { t, lang, view, setView } = useLab()
  const skeleton = useDelayed(view === "loading")
  const date = new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(
    new Date(scorecard.created_at)
  )

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={scorecard.candidate_name}
        description={`${t("scorecard.title")} · ${scorecard.candidate_role} · ${date} · ${scorecard.questions.length} questions · ${scorecard.duration_minutes} min`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => toast("Share link copied. It expires in 14 days.")}
            >
              <Link2 />
              Share
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Print"
              onClick={() => {
                window.print()
              }}
            >
              <Printer />
            </Button>
          </>
        }
      />

      {view === "error" ? (
        <LoadError
          what="this scorecard"
          onRetry={() => {
            setView("ready")
          }}
        />
      ) : view === "loading" ? (
        skeleton && <ScorecardSkeleton />
      ) : view === "empty" ? (
        <div className="rounded-lg border p-6 text-sm">
          <p className="font-medium">The scorecard is being prepared.</p>
          <p className="mt-1 text-muted-foreground">
            This usually takes a few minutes after the interview ends. We'll
            show it here as soon as it's ready.
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <Summary />
            <Questions />
          </div>
          <aside className="flex flex-col gap-6 lg:sticky lg:top-20">
            <Recording />
            <Skills />
          </aside>
        </div>
      )}
    </div>
  )
}

function Summary() {
  return (
    <section aria-labelledby="summary" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 id="summary" className="sr-only">
          Summary
        </h2>
        <p className="text-4xl font-semibold tracking-tight tabular-nums">
          {scorecard.overall_score}
          <span className="text-lg font-normal text-muted-foreground">
            {" "}
            / 100
          </span>
        </p>
        <ScoreBand score={scorecard.overall_score} />
      </div>
      <p className="max-w-prose text-pretty">{scorecard.summary}</p>

      <ul className="flex flex-col gap-3">
        {scorecard.comm_metrics.map((metric, i) => (
          <li
            key={metric.key}
            className="grid grid-cols-[9rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm sm:grid-cols-[12rem_minmax(0,1fr)_2.5rem]"
          >
            <span className="text-muted-foreground">{metric.label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted">
              <m.span
                className="block h-full origin-left rounded-full bg-brand rtl:origin-right"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: metric.value / 100 }}
                viewport={{ once: true }}
                transition={{
                  duration: duration.slow,
                  ease,
                  delay: i * 0.04,
                }}
              />
            </span>
            <span className="text-end tabular-nums">{metric.value}</span>
          </li>
        ))}
      </ul>

      <Collapsible>
        <CollapsibleTrigger className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          How is this scored?
          <ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 max-w-prose text-sm text-muted-foreground">
          Each answer is scored against the job's requirements by the AI
          interviewer, then checked for clarity, relevance and depth. The
          overall score weights technical questions higher. Scores are a
          starting point for your decision, not a replacement for it.
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}

function Questions() {
  return (
    <section aria-labelledby="questions">
      <h2 id="questions" className="mb-2 text-base font-medium">
        Answers
      </h2>
      <Accordion className="rounded-lg border">
        {scorecard.questions.map((q, i) => (
          <AccordionItem key={q.question} value={String(i)} className="px-4">
            <AccordionTrigger className="gap-4">
              <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
                <span className="text-xs font-normal text-muted-foreground">
                  Question {i + 1} · {q.type}
                </span>
                <span className="font-medium">{q.question}</span>
              </span>
              <span className="shrink-0 text-sm tabular-nums">
                {q.score}/10
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <div>
                <h3 className="mb-1 text-xs text-muted-foreground">Answer</h3>
                <p className="max-w-prose">{q.answer}</p>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-muted-foreground">
                  Assessment
                </h3>
                <p className="max-w-prose">{q.feedback}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => toast(`Recording would jump to ${q.at}`)}
              >
                <Play />
                Play from <span className="tabular-nums">{q.at}</span>
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

function Recording() {
  return (
    <section aria-labelledby="recording" className="flex flex-col gap-2">
      <h2 id="recording" className="text-base font-medium">
        Recording
      </h2>
      <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        <Play className="me-2 size-4" />
        <span className="tabular-nums">{scorecard.duration_minutes}:13</span>
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section aria-labelledby="skills" className="flex flex-col gap-3">
      <h2 id="skills" className="text-base font-medium">
        Skills shown
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {scorecard.candidate_skills.map((skill) => (
          <li key={skill.name} className="flex items-center justify-between">
            <span>{skill.name}</span>
            <StatusBadge tone={skill.evidence >= 3 ? "success" : "neutral"}>
              {skill.evidence} {skill.evidence === 1 ? "answer" : "answers"}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ScorecardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-4 w-2/3" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      <Skeleton className="aspect-video rounded-lg" />
    </div>
  )
}
