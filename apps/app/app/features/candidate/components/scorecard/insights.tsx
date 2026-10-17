import { useTranslation } from "@workspace/i18n/react"
import { ArrowRight, Check, Search } from "lucide-react"
import type { ReactNode } from "react"

import { hasItems } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"

export function Insights({ report, own }: { report: Scorecard; own: boolean }) {
  const { t } = useTranslation("scorecard")
  const scores = report.category_scores

  return (
    <div className="grid gap-8 md:grid-cols-3 md:gap-6">
      <List
        title={t("insights.strengths")}
        items={scores?.strengths}
        marker={<Check className="text-success" />}
      />
      <List
        title={t("insights.improve")}
        items={scores?.areas_for_improvement}
        marker={<Search className="text-warning" />}
      />
      {!own && (
        <List
          title={t("insights.recommendations")}
          items={scores?.recommendations}
          marker={<ArrowRight className="text-brand-text rtl:-scale-x-100" />}
        />
      )}
    </div>
  )
}

function List({
  title,
  items,
  marker,
}: {
  title: string
  items: string[] | null | undefined
  marker: ReactNode
}) {
  if (!hasItems(items)) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="flex flex-col gap-2.5 text-sm">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-pretty [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0"
          >
            {marker}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
