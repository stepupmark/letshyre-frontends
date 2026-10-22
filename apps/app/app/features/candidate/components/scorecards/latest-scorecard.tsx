import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Eye } from "lucide-react"
import * as m from "motion/react-m"
import { useId } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"
import { relativeTime } from "@/lib/relative-time"

import {
  BANDS,
  bandOfItem,
  roleOf,
  takenOn,
  timeOf,
} from "../../lib/scorecards"
import { ownScorecardQuery } from "../../queries/candidate.queries"
import type { ScorecardItem } from "../../schemas/candidate.schema"
import { ItemBand } from "./band"
import { BandHistory } from "./band-history"

const SKILLS = 4

export function LatestScorecard({
  item,
  history,
  enter,
}: {
  item: ScorecardItem
  history: ScorecardItem[]
  enter: boolean
}) {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  const client = useQueryClient()
  const titleId = useId()
  const role = roleOf(item) ?? t("list.interview")
  const date = takenOn(item, locale)
  const time = timeOf(item)
  const band = bandOfItem(item)
  const skills = item.candidate_skills ?? []
  const prefetch = () => {
    client.query(ownScorecardQuery(item.id)).catch(() => undefined)
  }

  return (
    <m.section
      aria-labelledby={titleId}
      initial={enter ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease }}
      className="grid gap-8 rounded-lg border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-12"
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">
            {t("list.latest")}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-tight text-pretty first-letter:uppercase"
            >
              {role}
            </h2>
            <ItemBand item={item} />
          </div>
          {date && time !== null && (
            <p className="text-sm text-muted-foreground">
              <time dateTime={new Date(time).toISOString()}>{date}</time>
              {" · "}
              {relativeTime(new Date(time).toISOString(), locale)}
            </p>
          )}
        </div>

        {band && <BandScale band={band} />}

        {skills.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {skills.slice(0, SKILLS).map((skill) => (
              <li key={skill}>
                <Badge variant="outline">{skill}</Badge>
              </li>
            ))}
            {skills.length > SKILLS && (
              <li>
                <Badge variant="ghost" className="text-muted-foreground">
                  {t("list.more", { count: skills.length - SKILLS })}
                </Badge>
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-4">
          <AppLink
            to={href("/employee/scorecards/:scorecardId", {
              scorecardId: item.id,
            })}
            onPointerEnter={prefetch}
            onFocus={prefetch}
            className={buttonLink({ className: "group max-sm:h-11" })}
          >
            {t("list.open")}
            <span className="sr-only">{role}</span>
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
          </AppLink>
          <p className="flex items-center gap-1.5 text-sm text-pretty text-muted-foreground">
            <Eye className="size-4 shrink-0" aria-hidden="true" />
            {t("list.shared")}
          </p>
        </div>
      </div>

      {history.length > 1 && <BandHistory items={history} />}
    </m.section>
  )
}

function BandScale({ band }: { band: (typeof BANDS)[number] }) {
  const { t } = useTranslation("candidate")
  const level = BANDS.indexOf(band)
  return (
    <div aria-hidden="true" className="grid max-w-sm grid-cols-3 gap-1">
      {BANDS.map((step, i) => (
        <div key={step} className="flex flex-col gap-1.5">
          <span className="h-1.5 overflow-hidden rounded-full bg-muted">
            {i <= level && (
              <m.span
                data-band={band}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: duration.base, ease, delay: i * 0.08 }}
                className="block h-full origin-left rounded-full data-[band=low]:bg-muted-foreground data-[band=partial]:bg-warning data-[band=strong]:bg-success rtl:origin-right"
              />
            )}
          </span>
          <span
            data-current={step === band}
            className="text-xs text-muted-foreground data-[current=true]:font-medium data-[current=true]:text-foreground"
          >
            {t(`list.scale.${step}`)}
          </span>
        </div>
      ))}
    </div>
  )
}
