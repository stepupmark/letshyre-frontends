import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { cn } from "@workspace/ui/lib/utils"
import {
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Printer,
  X,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { flushSync } from "react-dom"

import { Meter } from "@/components/meter"
import { QuestionText } from "@/components/question-text"
import { ScoreBand } from "@/components/score-band"
import { StatusBadge } from "@/components/status-badge"
import { safeUrl } from "@/lib/safe-url"

import type { Question, SharedScorecard } from "./schema"

const MCQ = new Set(["MCQ", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"])
// these arrive as Markdown problem statements, too long for the trigger line
const RICH = new Set(["CODING", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"])
const TYPES = [
  "mcq",
  "mcq_pseudocode",
  "pseudocode_mcq",
  "coding",
  "typing",
  "audio",
] as const
const SECTIONS = ["mcq", "pseudocode_mcq", "coding", "typing", "audio"] as const
const METRICS = [
  ["clarity", "clarity"],
  ["relevance", "relevance"],
  ["confidence", "confidence"],
  ["depth_of_thought", "depth"],
  ["key_concept_coverage", "keyConcept"],
] as const

type QuestionType = (typeof TYPES)[number]
const typeOf = (q: Question): QuestionType | null => {
  const type = (q.type ?? "").toLowerCase()
  return (TYPES as readonly string[]).includes(type)
    ? (type as QuestionType)
    : null
}

// an interview that ended early shouldn't read as a row of zero scores
function answered(questions: Question[]) {
  const kept: Question[] = []
  for (const q of questions) {
    const type = (q.type ?? "").toUpperCase()
    if (type === "AUDIO" ? q.is_dummy_audio : q.answer_provided === "") break
    kept.push(q)
  }
  return kept
}

const hasItems = <T,>(list: T[] | null | undefined): list is T[] =>
  Array.isArray(list) && list.length > 0

export function SharedReport({ report }: { report: SharedScorecard }) {
  const { t } = useTranslation("sharedScorecard")
  const scores = report.category_scores
  const questions = answered(scores?.question_breakdown ?? [])
  const video = safeUrl(report.interview_video)
  const hasInsights =
    hasItems(scores?.strengths) ||
    hasItems(scores?.areas_for_improvement) ||
    hasItems(scores?.recommendations)
  const sections = SECTIONS.filter(
    (key) => (scores?.section_summary?.[key]?.count ?? 0) > 0
  )

  const toc = [
    { id: "summary", label: t("toc.summary"), show: true },
    { id: "communication", label: t("toc.communication"), show: true },
    { id: "types", label: t("toc.types"), show: sections.length > 0 },
    { id: "insights", label: t("toc.insights"), show: hasInsights },
    { id: "recording", label: t("toc.recording"), show: Boolean(video) },
    { id: "profile", label: t("toc.profile"), show: true },
    { id: "answers", label: t("toc.answers"), show: true },
  ].filter((item) => item.show)

  return (
    <div className="grid gap-10 xl:grid-cols-[11rem_minmax(0,1fr)]">
      <nav
        aria-label={t("toc.label")}
        className="sticky top-20 hidden flex-col gap-1 self-start text-sm xl:flex print:hidden"
      >
        {toc.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <article className="flex min-w-0 flex-col gap-12">
        <Header report={report} />
        <Summary report={report} answeredCount={questions.length} />

        <Section id="communication" title={t("metrics.heading")}>
          <ul className="flex flex-col gap-3">
            {METRICS.map(([field, key], i) => (
              <Meter
                key={key}
                label={t(`metrics.${key}`)}
                value={scores?.comm_metrics?.[field] ?? 0}
                index={i}
              />
            ))}
          </ul>
        </Section>

        {sections.length > 0 && (
          <Section id="types" title={t("types.heading")}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {sections.map((key) => {
                const section = scores?.section_summary?.[key]
                const score = section?.section_score ?? 0
                return (
                  <li
                    key={key}
                    className="flex flex-col gap-1 rounded-lg border p-3"
                  >
                    <span className="text-xs text-muted-foreground">
                      {t(`types.${key}`)}
                    </span>
                    <span className="text-xl font-semibold tabular-nums">
                      {score}
                    </span>
                    {/* spoken and written answers are scored, not marked right or wrong */}
                    {key !== "audio" && key !== "typing" && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {t("types.correct", {
                          correct: section?.correct ?? 0,
                          count: section?.count ?? 0,
                        })}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </Section>
        )}

        {hasInsights && (
          <Section id="insights" title={t("insights.heading")}>
            <div className="grid gap-6 md:grid-cols-3">
              <Insights
                title={t("insights.strengths")}
                items={scores.strengths}
              />
              <Insights
                title={t("insights.improve")}
                items={scores.areas_for_improvement}
              />
              <Insights
                title={t("insights.recommendations")}
                items={scores.recommendations}
              />
            </div>
          </Section>
        )}

        {video && (
          <Section id="recording" title={t("recording.heading")}>
            {/* recordings come without a caption track */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              controls
              preload="none"
              src={video}
              className="aspect-video w-full rounded-lg bg-muted print:hidden"
            >
              {t("recording.unsupported")}
            </video>
          </Section>
        )}

        <Profile report={report} />
        <Answers questions={questions} />
      </article>
    </div>
  )
}

function Section({
  id,
  title,
  action,
  children,
}: {
  id: string
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-20 break-inside-avoid-page flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id={`${id}-title`} className="text-base font-medium">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Header({ report }: { report: SharedScorecard }) {
  const { t } = useTranslation("sharedScorecard")
  const name = report.candidate_name?.trim()
    ? report.candidate_name.trim()
    : t("header.unnamed")
  const photo = safeUrl(report.candidate_profile_photo)
  const years = report.candidate_total_experience_years
  const facts = [
    report.candidate_role,
    report.candidate_location,
    years === null
      ? null
      : years === 0
        ? t("header.fresher")
        : t("header.experience", { count: years }),
  ].filter(Boolean)

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Avatar className="size-16 sm:size-20">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className="text-xl">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h1
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight text-balance outline-none sm:text-3xl"
        >
          {name}
        </h1>
        {facts.length > 0 && (
          <p className="text-sm text-muted-foreground">{facts.join(" · ")}</p>
        )}
        {report.matched_job_title && (
          <Badge variant="secondary" className="max-w-full">
            <span className="truncate">
              {t("header.matchedTo", { job: report.matched_job_title })}
            </span>
          </Badge>
        )}
      </div>
      <Button
        variant="outline"
        className="self-start sm:self-center print:hidden"
        onClick={() => {
          window.print()
        }}
      >
        <Printer />
        {t("print")}
      </Button>
    </header>
  )
}

function Summary({
  report,
  answeredCount,
}: {
  report: SharedScorecard
  answeredCount: number
}) {
  const { t } = useTranslation("sharedScorecard")
  const score = report.overall_score ?? 0
  const match = report.ai_match

  return (
    <Section id="summary" title={t("summary.heading")}>
      <div
        className={cn(
          "grid gap-8",
          match && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="text-5xl font-semibold tracking-tight tabular-nums">
              {score}
              <span className="text-lg font-normal text-muted-foreground">
                {" "}
                {t("summary.outOf")}
              </span>
            </p>
            <ScoreBand score={score} of="interview" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("summary.basedOn", { count: answeredCount })}
          </p>
          <Collapsible>
            <CollapsibleTrigger className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden">
              {t("summary.howScored")}
              <ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 max-w-prose text-sm text-muted-foreground">
              {t("summary.howScoredBody")}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {match && (
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                {report.matched_job_title
                  ? t("match.headingFor", { job: report.matched_job_title })
                  : t("match.heading")}
              </h3>
              {match.ai_matching_score !== null && (
                <ScoreBand score={match.ai_matching_score} />
              )}
            </div>
            <ul className="flex flex-col gap-3">
              <Meter
                label={t("match.overall")}
                value={match.ai_matching_score ?? 0}
              />
              <Meter
                label={t("match.role")}
                value={match.role_match_score ?? 0}
                index={1}
              />
              <Meter
                label={t("match.skills")}
                value={match.skills_match_score ?? 0}
                index={2}
              />
            </ul>
            {match.rationale && (
              <div className="flex flex-col gap-1 text-sm">
                <p className="text-xs text-muted-foreground">
                  {t("match.why")}
                </p>
                <p className="max-w-prose text-pretty">{match.rationale}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  )
}

function Insights({
  title,
  items,
}: {
  title: string
  items: string[] | null | undefined
}) {
  if (!hasItems(items)) return null
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="flex list-disc flex-col gap-1.5 ps-5 text-sm text-pretty marker:text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function Profile({ report }: { report: SharedScorecard }) {
  const { t } = useTranslation("sharedScorecard")
  const links = (report.candidate_portfolio_links ?? [])
    .map(safeUrl)
    .filter((url): url is string => url !== null)
  const resume = safeUrl(report.candidate_resume)
  const named = (
    item:
      | string
      | { name?: string | null; title?: string | null; issuer?: string | null }
  ) =>
    typeof item === "string"
      ? { title: item, issuer: null }
      : { title: item.name ?? item.title ?? "", issuer: item.issuer ?? null }
  const awards = [
    ...(report.candidate_certifications ?? []),
    ...(report.candidate_accomplishments ?? []),
  ]
    .map(named)
    .filter((item) => item.title)

  const empty =
    !hasItems(report.candidate_skills) &&
    !hasItems(report.candidate_experience) &&
    !hasItems(report.candidate_education) &&
    !hasItems(report.candidate_projects) &&
    awards.length === 0 &&
    links.length === 0 &&
    !resume

  return (
    <Section id="profile" title={t("profile.heading")}>
      {empty ? (
        <p className="text-sm text-muted-foreground">{t("profile.empty")}</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {hasItems(report.candidate_skills) && (
            <Group title={t("profile.skills")} wide>
              <ul className="flex flex-wrap gap-1.5">
                {report.candidate_skills.map((skill) => (
                  <li key={skill}>
                    <Badge variant="outline">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </Group>
          )}
          {hasItems(report.candidate_experience) && (
            <Group title={t("profile.experience")}>
              <ul className="flex flex-col gap-4">
                {report.candidate_experience.map((job, i) => (
                  <li key={i} className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium">{job.role ?? "—"}</span>
                    <span className="text-muted-foreground">
                      {[job.company, job.duration].filter(Boolean).join(" · ")}
                    </span>
                    {job.description && (
                      <p className="mt-1 max-w-prose text-pretty">
                        {job.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Group>
          )}
          {hasItems(report.candidate_education) && (
            <Group title={t("profile.education")}>
              <ul className="flex flex-col gap-4">
                {report.candidate_education.map((school, i) => (
                  <li key={i} className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium">
                      {school.institution ?? "—"}
                    </span>
                    <span className="text-muted-foreground">
                      {[school.degree, school.duration]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </Group>
          )}
          {hasItems(report.candidate_projects) && (
            <Group title={t("profile.projects")}>
              <ul className="flex flex-col gap-4">
                {report.candidate_projects.map((project, i) => (
                  <li key={i} className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium">
                      {project.title ?? project.name ?? t("profile.untitled")}
                    </span>
                    {project.description && (
                      <p className="max-w-prose text-pretty text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Group>
          )}
          {awards.length > 0 && (
            <Group title={t("profile.awards")}>
              <ul className="flex flex-col gap-2 text-sm">
                {awards.map((award, i) => (
                  <li key={i}>
                    <span className="font-medium">{award.title}</span>
                    {award.issuer && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {award.issuer}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Group>
          )}
          {(links.length > 0 || resume) && (
            <Group title={t("profile.links")}>
              <ul className="flex flex-col gap-2 text-sm">
                {resume && (
                  <li>
                    <ExternalLinkItem href={resume} icon={<FileText />}>
                      {t("profile.resume")}
                    </ExternalLinkItem>
                  </li>
                )}
                {links.map((href) => (
                  <li key={href}>
                    <ExternalLinkItem href={href} icon={<ExternalLink />}>
                      {new URL(href).host +
                        new URL(href).pathname.replace(/\/$/, "")}
                    </ExternalLinkItem>
                  </li>
                ))}
              </ul>
            </Group>
          )}
        </div>
      )}
    </Section>
  )
}

function Group({
  title,
  wide = false,
  children,
}: {
  title: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-3", wide && "md:col-span-2")}>
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

function ExternalLinkItem({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex max-w-full items-center gap-2 underline-offset-4 hover:underline [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground"
    >
      {icon}
      <span className="truncate">{children}</span>
    </a>
  )
}

function Answers({ questions }: { questions: Question[] }) {
  const { t } = useTranslation("sharedScorecard")
  const locale = useLocale()
  const all = questions.map((_, i) => String(i))
  const [open, setOpen] = useState<string[]>([])
  const allOpen = open.length === all.length && all.length > 0

  // printing shows every answer, not just the ones left open
  useEffect(() => {
    const expand = () => {
      flushSync(() => {
        setOpen(all)
      })
    }
    window.addEventListener("beforeprint", expand)
    return () => {
      window.removeEventListener("beforeprint", expand)
    }
  })

  return (
    <Section
      id="answers"
      title={t("answers.heading")}
      action={
        all.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="print:hidden"
            onClick={() => {
              setOpen(allOpen ? [] : all)
            }}
          >
            {allOpen ? t("answers.collapseAll") : t("answers.expandAll")}
          </Button>
        )
      }
    >
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("answers.none")}</p>
      ) : (
        <Accordion
          multiple
          hiddenUntilFound
          value={open}
          onValueChange={(value) => {
            setOpen(value as string[])
          }}
          className="rounded-lg border"
        >
          {questions.map((q, i) => {
            const type = typeOf(q)
            const upper = (q.type ?? "").toUpperCase()
            const label = t(
              type ? `answers.types.${type}` : "answers.types.other"
            )
            const mcq = MCQ.has(upper)
            return (
              <AccordionItem key={i} value={String(i)} className="px-4">
                <AccordionTrigger className="gap-4 hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
                    <span className="text-xs font-normal text-muted-foreground">
                      {t("answers.number", {
                        number: new Intl.NumberFormat(locale).format(i + 1),
                      })}{" "}
                      · {label}
                    </span>
                    <span className="line-clamp-2 font-medium">
                      {RICH.has(upper)
                        ? label
                        : q.question_text?.length
                          ? q.question_text
                          : t("answers.noQuestion")}
                    </span>
                  </span>
                  {mcq && (
                    <StatusBadge tone={q.is_correct ? "success" : "danger"}>
                      {q.is_correct ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <X aria-hidden="true" />
                      )}
                      {q.is_correct ? t("answers.correct") : t("answers.wrong")}
                    </StatusBadge>
                  )}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pb-4">
                  {RICH.has(upper) && q.question_text && (
                    <QuestionText markdown={q.question_text} />
                  )}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs text-muted-foreground">
                      {t("answers.answer")}
                    </h3>
                    <Answer q={q} />
                  </div>
                  {q.feedback && (
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs text-muted-foreground">
                        {t("answers.assessment")}
                      </h3>
                      <p className="max-w-prose text-pretty">{q.feedback}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </Section>
  )
}

function Answer({ q }: { q: Question }) {
  const { t } = useTranslation("sharedScorecard")
  const type = (q.type ?? "").toUpperCase()

  if (MCQ.has(type)) {
    return (
      <ul className="flex flex-col gap-1.5">
        {(q.options ?? []).map((option, i) => {
          const chosen = option === q.answer_provided
          const correct = option === q.correct_answer
          return (
            <li
              key={i}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md border px-3 py-2",
                correct && "border-success bg-success-muted",
                chosen && !correct && "border-danger bg-danger-muted"
              )}
            >
              <span>{option}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {[
                  chosen && t("answers.chosen"),
                  correct && t("answers.correctAnswer"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  if (type === "CODING") {
    return q.answer_provided ? (
      <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-[0.8125rem] leading-relaxed">
        <code>{q.answer_provided}</code>
      </pre>
    ) : (
      <p className="text-muted-foreground">{t("answers.noCode")}</p>
    )
  }

  if (type === "AUDIO") {
    const audio = safeUrl(q.candidate_audio_file_url)
    return audio ? (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio
        controls
        preload="none"
        src={audio}
        className="w-full print:hidden"
      >
        {t("answers.audioUnsupported")}
      </audio>
    ) : (
      <p className="text-muted-foreground">{t("answers.noAudio")}</p>
    )
  }

  return q.answer_provided ? (
    <p className="max-w-prose text-pretty whitespace-pre-line">
      {q.answer_provided}
    </p>
  ) : (
    <p className="text-muted-foreground">{t("answers.noAnswer")}</p>
  )
}
