import { safeUrl } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { StatusBadge } from "@/components/status-badge"
import { duration, ease } from "@/lib/motion"
import { bandOf, type Band } from "@/lib/score-band"

import { placeOf } from "../../lib/profile-format"
import type { Scorecard } from "../../schemas/scorecard.schema"
import { ScoreRing } from "../art/score-ring"
import { ScoreBreakdown } from "./score-breakdown"
import { Takeaways } from "./takeaways"

// a weak interview reads as a warning sign here, unlike the neutral band elsewhere
const TONE = {
  strong: "success",
  partial: "warning",
  low: "danger",
} as const satisfies Record<Band, string>

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
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
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
              title={report.matched_job_title}
              className="max-w-full self-start border-brand/30 bg-brand-muted text-brand-text"
            >
              <span className="truncate">
                {t("header.matchedTo", { job: report.matched_job_title })}
              </span>
            </Badge>
          )}

          {actions && (
            <div className="flex flex-wrap gap-2 print:hidden">{actions}</div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <ScoreRing
            score={score ?? 0}
            tone={score === null ? "brand" : TONE[bandOf(score)]}
            className="size-20 sm:size-28"
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
              <span className="text-xs font-medium text-muted-foreground">
                —
              </span>
            ) : (
              <>
                <span className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  <AnimatedNumber value={score} locale={locale} from={0} />
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {t("summary.outOf")}
                </span>
              </>
            )}
          </ScoreRing>
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            {score === null ? (
              <StatusBadge tone="neutral">{t("summary.notScored")}</StatusBadge>
            ) : (
              <m.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.base, ease, delay: 0.44 }}
                className="print:transform-none! print:opacity-100!"
              >
                <StatusBadge tone={TONE[bandOf(score)]}>
                  {t(`common:interviewBand.${bandOf(score)}`)}
                </StatusBadge>
              </m.span>
            )}
            <p className="text-xs text-pretty text-muted-foreground">
              {t("summary.basedOn", { count: answeredCount })}
            </p>
            <ScoreBreakdown report={report} own={own} />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <Takeaways report={report} own={own} onProbe={onProbe} />
      </div>
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
    own ? null : placeOf(report.candidate_location),
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
