import { useTranslation } from "@workspace/i18n/react"
import type { ReactNode } from "react"

import { compareHref } from "../../lib/compare"
import { SECTIONS, takeaways } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"
import { CompareFailed, ComparePerson } from "./compare-person"
import { Group, ScoreRow, TextRow, type Score } from "./score-row"

const METRICS = [
  ["clarity", "clarity"],
  ["relevance", "relevance"],
  ["confidence", "confidence"],
  ["depth_of_thought", "depth"],
  ["key_concept_coverage", "keyConcept"],
] as const

export interface Compared {
  id: string
  report?: Scorecard
  retry: () => void
  retrying: boolean
}

interface Row {
  label: string
  pick: (report: Scorecard) => Score
}

export function CompareView({ items }: { items: Compared[] }) {
  const { t } = useTranslation("scorecard")
  const reports = items.map((item) => item.report)
  const known = (row: Row) =>
    reports.some((r) => r !== undefined && typeof row.pick(r) === "number")

  const groups: [string, Row[]][] = [
    [
      t("compare.summary"),
      [
        { label: t("compare.overall"), pick: (r) => r.overall_score },
        {
          label: t("takeaways.match"),
          pick: (r) => r.ai_match?.ai_matching_score,
        },
      ],
    ],
    [
      t("metrics.heading"),
      METRICS.map(([field, key]) => ({
        label: t(`metrics.${key}`),
        pick: (r) => r.category_scores?.comm_metrics?.[field],
      })),
    ],
    [
      t("types.heading"),
      SECTIONS.filter((key) =>
        reports.some(
          (r) => (r?.category_scores?.section_summary?.[key]?.count ?? 0) > 0
        )
      ).map((key) => ({
        label: t(`types.${key}`),
        pick: (r) => r.category_scores?.section_summary?.[key]?.section_score,
      })),
    ],
  ]

  let index = 0
  const body: ReactNode[] = []
  for (const [label, rows] of groups) {
    const shown = rows.filter(known)
    if (shown.length === 0) continue
    body.push(<Group key={label} label={label} span={items.length} />)
    for (const row of shown) {
      body.push(
        <ScoreRow
          key={row.label}
          label={row.label}
          index={index++}
          values={reports.map((r) => (r ? row.pick(r) : undefined))}
        />
      )
    }
  }

  const insights = reports.map((r) => (r ? takeaways(r) : null))
  const removable = items.length > 2

  return (
    <div className="overflow-x-auto rounded-lg border bg-card lg:overflow-clip">
      <table className="w-full min-w-2xl table-fixed border-collapse text-sm">
        <caption className="sr-only">{t("compare.title")}</caption>
        <thead className="lg:sticky lg:top-14 lg:z-20">
          <tr className="border-b bg-card">
            <th
              scope="col"
              className="sticky inset-s-0 z-10 w-36 bg-card p-4 text-start sm:w-44"
            >
              <span className="sr-only">{t("compare.criteria")}</span>
            </th>
            {items.map(({ id, report, retry, retrying }) => (
              <th key={id} scope="col" className="p-4 text-start align-top">
                {report ? (
                  <ComparePerson
                    id={id}
                    report={report}
                    removeTo={
                      removable
                        ? compareHref(
                            items.flatMap((item) =>
                              item.id === id ? [] : [item.id]
                            )
                          )
                        : undefined
                    }
                  />
                ) : (
                  <CompareFailed onRetry={retry} retrying={retrying} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body}
          <Group label={t("insights.heading")} span={items.length} />
          <TextRow
            label={t("takeaways.strength")}
            values={insights.map((i) => i?.strength)}
          />
          <TextRow
            label={t("takeaways.probe")}
            values={insights.map((i) => i?.gap)}
          />
        </tbody>
      </table>
    </div>
  )
}
