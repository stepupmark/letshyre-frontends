import { useLocale, useTranslation } from "@workspace/i18n/react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import { bandOfItem, takenOn } from "../../lib/scorecards"
import type { ScorecardItem } from "../../schemas/candidate.schema"

export function BandHistory({ items }: { items: ScorecardItem[] }) {
  const { t } = useTranslation(["candidate", "common"])
  const locale = useLocale()
  const oldest = items.at(0)
  const newest = items.at(-1)
  const first = oldest ? takenOn(oldest, locale) : null
  const last = newest ? takenOn(newest, locale) : null

  return (
    <figure className="flex flex-col gap-3 self-end">
      <figcaption className="text-xs font-medium text-muted-foreground">
        {t("list.history")}
      </figcaption>
      <ol className="flex h-20 items-end gap-1.5 border-b pb-px">
        {items.map((item, i) => {
          const band = bandOfItem(item) ?? "low"
          return (
            <li key={item.id} className="flex h-full max-w-6 flex-1 items-end">
              <m.span
                aria-hidden="true"
                data-band={band}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: duration.base,
                  ease,
                  delay: Math.min(i, 5) * 0.03,
                }}
                className="block w-full origin-bottom rounded-t-sm data-[band=low]:h-1/3 data-[band=low]:bg-muted-foreground/60 data-[band=partial]:h-2/3 data-[band=partial]:bg-warning data-[band=strong]:h-full data-[band=strong]:bg-success"
              />
              <span className="sr-only">
                {t("list.historyItem", {
                  date: takenOn(item, locale) ?? t("list.noDate"),
                  band: t(`common:interviewBand.${band}`),
                })}
              </span>
            </li>
          )
        })}
      </ol>
      {first && last && (
        <div
          aria-hidden="true"
          className="flex justify-between gap-3 text-xs text-muted-foreground tabular-nums"
        >
          <span>{first}</span>
          <span>{last}</span>
        </div>
      )}
    </figure>
  )
}
