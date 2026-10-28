import { safeUrl } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Printer } from "lucide-react"
import type { ReactNode } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { ScoreBand } from "@/components/score-band"
import { bandOf } from "@/lib/score-band"

import type { Scorecard } from "../../schemas/scorecard.schema"
import { ScoreRing } from "../art/score-ring"
import { ScoreBreakdown } from "./score-breakdown"
import { Takeaways } from "./takeaways"

export function Verdict({
  report,
  own,
  answeredCount,
  actions,
  onProbe,
}: {
  report: Scorecard
  own: boolean
  answeredCount: number
  actions?: ReactNode
  onProbe?: () => void
}) {
  const { t } = useTranslation(["scorecard", "common"])
  const locale = useLocale()
  const score = report.overall_score
  const name = report.candidate_name?.trim()
    ? report.candidate_name.trim()
    : t("header.unnamed")
  const photo = safeUrl(report.candidate_profile_photo)

  return (
    <section
      id="summary"
      aria-labelledby="summary-title"
      className="flex flex-col gap-8 rounded-2xl border p-5 sm:p-8"
    >
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 sm:size-16">
              {photo && <AvatarImage src={photo} alt="" />}
              <AvatarFallback className="bg-brand-muted text-lg font-semibold text-brand-text">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <h1
                id="summary-title"
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight text-balance text-brand-text outline-none sm:text-3xl"
              >
                {own ? t("header.yours") : name}
              </h1>
              <Facts report={report} own={own} />
            </div>
          </div>

          {report.matched_job_title && (
            <Badge
              variant="outline"
              className="max-w-full self-start border-brand/30 bg-brand-muted text-brand-text"
            >
              <span className="truncate">
                {t("header.matchedTo", { job: report.matched_job_title })}
              </span>
            </Badge>
          )}

          <div className="flex flex-wrap gap-2 print:hidden">
            {actions}
            <Button
              variant="outline"
              onClick={() => {
                window.print()
              }}
            >
              <Printer />
              {t("print")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 md:pe-2">
          <ScoreRing
            score={score ?? 0}
            label={
              score === null
                ? t("summary.notScored")
                : t("ring.label", {
                    score,
                    band: t(`common:interviewBand.${bandOf(score)}`),
                  })
            }
          >
            {score === null ? (
              <span className="text-sm font-medium text-muted-foreground">
                {t("summary.notScored")}
              </span>
            ) : (
              <>
                <span className="text-4xl font-semibold tracking-tight text-brand-text">
                  <AnimatedNumber value={score} locale={locale} from={0} />
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("summary.outOf")}
                </span>
              </>
            )}
          </ScoreRing>
          {score !== null && <ScoreBand score={score} of="interview" />}
          <p className="text-xs text-muted-foreground">
            {t("summary.basedOn", { count: answeredCount })}
          </p>
          <ScoreBreakdown report={report} own={own} />
        </div>
      </div>

      <Takeaways report={report} own={own} onProbe={onProbe} />
    </section>
  )
}

function Facts({ report, own }: { report: Scorecard; own: boolean }) {
  const { t } = useTranslation("scorecard")
  const locale = useLocale()
  const years = report.candidate_total_experience_years
  const taken = report.created_at ? new Date(report.created_at) : null
  const facts = [
    report.candidate_role,
    own ? null : report.candidate_location,
    years === null || own
      ? null
      : years === 0
        ? t("header.fresher")
        : t("header.experience", { count: years }),
    taken && !Number.isNaN(taken.getTime())
      ? t("header.taken", {
          date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
            taken
          ),
        })
      : null,
  ].filter(Boolean)

  if (facts.length === 0) return null
  return (
    <p className="text-sm text-pretty text-muted-foreground">
      {facts.join(" · ")}
    </p>
  )
}
