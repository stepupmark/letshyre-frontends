import { useTranslation } from "@workspace/i18n/react"
import { ArrowDown, Check, Crosshair, Search } from "lucide-react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"
import { bandOf } from "@/lib/score-band"

import { takeaways } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"

export function Takeaways({
  report,
  own,
  onProbe,
}: {
  report: Scorecard
  own: boolean
  onProbe?: () => void
}) {
  const { t } = useTranslation(["scorecard", "common"])
  const { strength, gap, match } = takeaways(report)

  const tiles = [
    strength && {
      key: "strength",
      icon: <Check className="text-success" />,
      label: t("takeaways.strength"),
      body: strength,
    },
    gap && {
      key: "gap",
      icon: <Search className="text-warning" />,
      label: own ? t("takeaways.improve") : t("takeaways.probe"),
      body: gap,
      action: onProbe && (
        <button
          type="button"
          onClick={onProbe}
          className="group/probe mt-auto flex min-h-9 items-center gap-1.5 self-start rounded-md text-xs font-medium text-brand-text underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 print:hidden"
        >
          {t("takeaways.seeWrong")}
          <ArrowDown
            aria-hidden
            className="size-3.5 transition-transform group-hover/probe:translate-y-0.5 motion-reduce:transition-none"
          />
        </button>
      ),
    },
    match !== null && {
      key: "match",
      icon: <Crosshair className="text-brand-text" />,
      label: t("takeaways.match"),
      body: (
        <span className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-brand-text tabular-nums">
            {match}
          </span>
          {t(`common:band.${bandOf(match)}`)}
        </span>
      ),
    },
  ].filter(Boolean) as {
    key: string
    icon: ReactNode
    label: string
    body: ReactNode
    action?: ReactNode
  }[]

  if (tiles.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium text-muted-foreground">
        {t("takeaways.heading")}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-3">
        {tiles.map((tile, i) => (
          <m.li
            key={tile.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.base,
              ease,
              delay: 0.2 + i * 0.04,
            }}
            className="flex flex-col gap-2 rounded-lg border p-4 print:transform-none! print:opacity-100!"
          >
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
              {tile.icon}
              {tile.label}
            </span>
            <span className="line-clamp-3 text-sm text-pretty">
              {tile.body}
            </span>
            {tile.action}
          </m.li>
        ))}
      </ul>
    </div>
  )
}
