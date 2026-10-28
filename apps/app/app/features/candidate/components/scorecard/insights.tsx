import { useTranslation } from "@workspace/i18n/react"
import {
  ArrowRight,
  Check,
  Lightbulb,
  Search,
  ThumbsUp,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import type { ReactNode } from "react"

import { hasItems } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"
import { SubHeading } from "./sub-heading"

export function Insights({ report, own }: { report: Scorecard; own: boolean }) {
  const { t } = useTranslation("scorecard")
  const scores = report.category_scores

  return (
    <div className="grid gap-8 md:grid-cols-3 md:gap-6">
      <List
        icon={ThumbsUp}
        title={t("insights.strengths")}
        items={scores?.strengths}
        marker={<Check className="text-success" />}
      />
      <List
        icon={TrendingUp}
        title={t("insights.improve")}
        items={scores?.areas_for_improvement}
        marker={<Search className="text-warning" />}
      />
      {!own && (
        <List
          icon={Lightbulb}
          title={t("insights.recommendations")}
          items={scores?.recommendations}
          marker={<ArrowRight className="text-brand-text rtl:-scale-x-100" />}
        />
      )}
    </div>
  )
}

function List({
  icon,
  title,
  items,
  marker,
}: {
  icon: LucideIcon
  title: string
  items: string[] | null | undefined
  marker: ReactNode
}) {
  if (!hasItems(items)) return null
  return (
    <div className="flex flex-col gap-3">
      <SubHeading icon={icon}>{title}</SubHeading>
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
