import { safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { useState, type ReactNode } from "react"

import { useActiveChapter } from "../../hooks/use-active-chapter"
import {
  answered,
  hasInsights,
  isWrong,
  scoredSections,
  type Viewer,
} from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"
import type { ChapterId } from "../art/chapter-glyphs"
import { Recording } from "../recording"
import { Answers } from "./answers"
import { Chapter } from "./chapter"
import { ChapterPills, ChapterRail } from "./chapter-rail"
import { Insights } from "./insights"
import { Profile } from "./profile"
import { Communication, JobFit, QuestionTypes } from "./scores"
import { Verdict } from "./verdict"

export function ScorecardView({
  report,
  viewer = "employer",
  actions,
  footer,
}: {
  report: Scorecard
  viewer?: Viewer
  actions?: ReactNode
  footer?: ReactNode
}) {
  const own = viewer === "candidate"
  const { t } = useTranslation("scorecard")
  const questions = answered(report.category_scores?.question_breakdown ?? [])
  // the candidate's own copy has never shown the recording
  const video = own ? null : safeUrl(report.interview_video)
  const match = report.ai_match
  const [onlyWrong, setOnlyWrong] = useState(false)

  const probe = () => {
    setOnlyWrong(true)
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    document
      .getElementById("answers")
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
    document.getElementById("answers-title")?.focus({ preventScroll: true })
  }

  const chapters: { id: ChapterId; title: string; body: ReactNode }[] = []
  if (match)
    chapters.push({
      id: "match",
      title: report.matched_job_title
        ? t("match.headingFor", { job: report.matched_job_title })
        : t("match.heading"),
      body: <JobFit match={match} />,
    })
  chapters.push({
    id: "communication",
    title: t("metrics.heading"),
    body: <Communication report={report} />,
  })
  if (scoredSections(report).length > 0)
    chapters.push({
      id: "types",
      title: t("types.heading"),
      body: <QuestionTypes report={report} />,
    })
  if (hasInsights(report, own))
    chapters.push({
      id: "insights",
      title: t("insights.heading"),
      body: <Insights report={report} own={own} />,
    })
  if (video)
    chapters.push({
      id: "recording",
      title: t("recording.heading"),
      body: <Recording src={video} />,
    })
  if (!own)
    chapters.push({
      id: "profile",
      title: t("profile.heading"),
      body: <Profile report={report} />,
    })

  const rail = [
    { id: "summary", label: t("toc.summary") },
    ...chapters.map((chapter) => ({
      id: chapter.id,
      label: chapter.id === "match" ? t("match.heading") : chapter.title,
    })),
    { id: "answers", label: t("answers.heading") },
  ]
  const active = useActiveChapter(rail.map((item) => item.id))

  return (
    <div className="grid gap-10 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-12">
      <ChapterRail items={rail} active={active} />

      <article className="flex min-w-0 flex-col gap-14 sm:gap-16">
        <div className="flex flex-col gap-4">
          <Verdict
            report={report}
            own={own}
            answeredCount={questions.length}
            actions={actions}
            onProbe={questions.some(isWrong) ? probe : undefined}
          />
          <ChapterPills items={rail} active={active} />
        </div>

        {chapters.map((chapter) => (
          <Chapter
            key={chapter.id}
            id={chapter.id}
            title={chapter.title}
            hint={t(`chapters.${chapter.id}`)}
          >
            {chapter.body}
          </Chapter>
        ))}

        <Answers
          questions={questions}
          own={own}
          onlyWrong={onlyWrong}
          onFilter={setOnlyWrong}
        />
        {footer}
      </article>
    </div>
  )
}
