import { useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import * as m from "motion/react-m"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { duration, ease } from "@/lib/motion"
import { safeUrl } from "@/lib/safe-url"

import { leaders } from "../../lib/compare"
import { SECTIONS, takeaways } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"

const METRICS = [
  ["clarity", "clarity"],
  ["relevance", "relevance"],
  ["confidence", "confidence"],
  ["depth_of_thought", "depth"],
  ["key_concept_coverage", "keyConcept"],
] as const

export interface Compared {
  id: string
  report: Scorecard
}

type Score = number | null | undefined

export function CompareView({ items }: { items: Compared[] }) {
  const { t } = useTranslation("scorecard")
  const sections = SECTIONS.filter((key) =>
    items.some(
      ({ report }) =>
        (report.category_scores?.section_summary?.[key]?.count ?? 0) > 0
    )
  )
  const scoreRow = (label: string, pick: (report: Scorecard) => Score) => (
    <ScoreRow
      key={label}
      label={label}
      values={items.map(({ report }) => pick(report))}
    />
  )

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-xl border-collapse text-sm">
        <caption className="sr-only">{t("compare.title")}</caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="w-40 p-4 text-start align-bottom">
              <span className="sr-only">{t("compare.criteria")}</span>
            </th>
            {items.map(({ id, report }) => (
              <th key={id} scope="col" className="p-4 text-start align-top">
                <Person id={id} report={report} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Group label={t("compare.summary")} span={items.length} />
          {scoreRow(t("compare.overall"), (r) => r.overall_score)}
          {scoreRow(t("takeaways.match"), (r) => r.ai_match?.ai_matching_score)}

          <Group label={t("metrics.heading")} span={items.length} />
          {METRICS.map(([field, key]) =>
            scoreRow(
              t(`metrics.${key}`),
              (r) => r.category_scores?.comm_metrics?.[field]
            )
          )}

          {sections.length > 0 && (
            <Group label={t("types.heading")} span={items.length} />
          )}
          {sections.map((key) =>
            scoreRow(
              t(`types.${key}`),
              (r) => r.category_scores?.section_summary?.[key]?.section_score
            )
          )}

          <Group label={t("insights.heading")} span={items.length} />
          <TextRow
            label={t("takeaways.strength")}
            values={items.map(({ report }) => takeaways(report).strength)}
          />
          <TextRow
            label={t("takeaways.probe")}
            values={items.map(({ report }) => takeaways(report).gap)}
          />
        </tbody>
      </table>
    </div>
  )
}

function Person({ id, report }: { id: string; report: Scorecard }) {
  const { t } = useTranslation("scorecard")
  const name = report.candidate_name?.trim()
    ? report.candidate_name.trim()
    : t("header.unnamed")
  const photo = safeUrl(report.candidate_profile_photo)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar>
          {photo && <AvatarImage src={photo} alt="" />}
          <AvatarFallback className="bg-brand-muted font-semibold text-brand-text">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-brand-text">{name}</span>
          {report.candidate_role && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {report.candidate_role}
            </span>
          )}
        </div>
      </div>
      <AppLink
        to={href("/employer/candidates/:candidateId/scorecard", {
          candidateId: id,
        })}
        className="self-start rounded-sm text-xs font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {t("compare.open")}
      </AppLink>
    </div>
  )
}

function Group({ label, span }: { label: string; span: number }) {
  return (
    <tr className="bg-muted/50">
      <th
        scope="colgroup"
        colSpan={span + 1}
        className="px-4 py-2 text-start text-xs font-medium text-muted-foreground"
      >
        {label}
      </th>
    </tr>
  )
}

function ScoreRow({ label, values }: { label: string; values: Score[] }) {
  const { t } = useTranslation("scorecard")
  const top = leaders(values)

  return (
    <tr className="border-b last:border-0">
      <th
        scope="row"
        className="p-4 text-start font-normal text-muted-foreground"
      >
        {label}
      </th>
      {values.map((value, i) => (
        <td
          key={i}
          className={cn("p-4 align-middle", top.has(i) && "bg-brand-muted/60")}
        >
          {typeof value === "number" ? (
            <Bar value={value} lead={top.has(i)} label={t("compare.highest")} />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
      ))}
    </tr>
  )
}

function Bar({
  value,
  lead,
  label,
}: {
  value: number
  lead: boolean
  label: string
}) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "w-8 text-end tabular-nums",
          lead ? "font-semibold text-brand-text" : undefined
        )}
      >
        {clamped}
      </span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted print:border">
        <span className="block h-full" style={{ width: `${clamped}%` }}>
          <m.span
            className={cn(
              "block h-full origin-left rounded-full rtl:origin-right print:transform-none!",
              lead ? "bg-brand" : "bg-brand/50"
            )}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: duration.slow, ease }}
          />
        </span>
      </span>
      {lead && <span className="sr-only">{label}</span>}
    </div>
  )
}

function TextRow({
  label,
  values,
}: {
  label: string
  values: (string | null)[]
}) {
  return (
    <tr className="border-b last:border-0">
      <th
        scope="row"
        className="p-4 text-start align-top font-normal text-muted-foreground"
      >
        {label}
      </th>
      {values.map((value, i) => (
        <td key={i} className="p-4 align-top text-pretty">
          {value ?? <span className="text-muted-foreground">—</span>}
        </td>
      ))}
    </tr>
  )
}
