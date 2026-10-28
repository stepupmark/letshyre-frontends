import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { useTranslation } from "@workspace/i18n/react"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { BANDS, type BandFilter } from "../lib/job-matches"

export function BandTabs({
  value,
  counts,
  onChange,
}: {
  value: BandFilter
  counts: Record<BandFilter, number>
  onChange: (band: BandFilter) => void
}) {
  const { t } = useTranslation("matches")
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        onChange(next as BandFilter)
      }}
    >
      <div className="-mx-4 no-scrollbar overflow-x-auto overflow-y-hidden px-4">
        <TabsList
          aria-label={t("bands.label")}
          variant="line"
          className="relative gap-0 border-b p-0 group-data-horizontal/tabs:h-10"
        >
          {BANDS.map((band) => (
            <TabsTrigger
              key={band}
              value={band}
              className="h-full flex-none gap-1.5 px-3 after:hidden data-active:text-foreground"
            >
              {band === "all" ? t("bands.all") : t(`range.${band}`)}
              <span className="text-xs text-muted-foreground tabular-nums">
                {counts[band]}
              </span>
            </TabsTrigger>
          ))}
          <BaseTabs.Indicator
            className="absolute -bottom-px h-0.5 rounded-full bg-foreground transition-[translate,width] duration-300 ease-out motion-reduce:transition-none"
            style={{
              // Base UI measures the active tab from the physical left, in both directions
              left: 0,
              translate: "var(--active-tab-left) 0",
              width: "var(--active-tab-width)",
            }}
          />
        </TabsList>
      </div>
    </Tabs>
  )
}
