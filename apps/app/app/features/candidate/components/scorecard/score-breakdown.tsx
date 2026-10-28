import { dirFor } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { Info, LayoutList, MessageCircle } from "lucide-react"

import { Meter } from "@/components/meter"

import { scoredSections } from "../../lib/scorecard"
import type { Scorecard } from "../../schemas/scorecard.schema"
import { Communication } from "./scores"
import { SubHeading } from "./sub-heading"

export function ScoreBreakdown({
  report,
  own,
}: {
  report: Scorecard
  own: boolean
}) {
  const { t } = useTranslation("scorecard")
  const side = dirFor(useLocale()) === "rtl" ? "left" : "right"
  const summary = report.category_scores?.section_summary
  const sections = scoredSections(report)
  const total = sections.reduce(
    (sum, key) => sum + (summary?.[key]?.count ?? 0),
    0
  )

  return (
    <Sheet>
      <SheetTrigger className="flex min-h-10 items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 print:hidden">
        <Info aria-hidden className="size-4" />
        {t("summary.howScored")}
      </SheetTrigger>
      <SheetContent side={side} className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="text-brand-text">
            {t("breakdown.title")}
          </SheetTitle>
          <SheetDescription className="text-pretty">
            {own ? t("summary.howScoredYours") : t("summary.howScoredBody")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-8 overflow-y-auto p-4">
          {sections.length > 0 && (
            <section className="flex flex-col gap-3">
              <SubHeading icon={LayoutList}>{t("types.heading")}</SubHeading>
              <ul className="flex flex-col gap-3">
                {sections.map((key, i) => (
                  <li key={key} className="flex flex-col gap-1">
                    <ul>
                      <Meter
                        label={t(`types.${key}`)}
                        value={summary?.[key]?.section_score ?? 0}
                        index={i}
                      />
                    </ul>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {t("breakdown.share", {
                        count: summary?.[key]?.count ?? 0,
                        total,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <SubHeading icon={MessageCircle}>{t("metrics.heading")}</SubHeading>
            <Communication report={report} />
          </section>

          <p className="rounded-lg bg-muted/60 p-3 text-sm text-pretty text-muted-foreground">
            {t("breakdown.note")}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
