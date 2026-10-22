import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { useTranslation } from "@workspace/i18n/react"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

import { JOB_TABS } from "../../lib/employer-jobs"
import type { JobTab } from "../../types"

export function JobTabs({
  value,
  onChange,
}: {
  value: JobTab
  onChange: (tab: JobTab) => void
}) {
  const { t } = useTranslation("jobs")
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        onChange(next as JobTab)
      }}
    >
      <div className="-mx-4 no-scrollbar overflow-x-auto overflow-y-hidden px-4">
        <TabsList
          variant="line"
          className="relative gap-0 border-b p-0 group-data-horizontal/tabs:h-10"
        >
          {JOB_TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="h-full flex-none px-3 after:hidden data-active:text-foreground"
            >
              {t(`list.tabs.${tab}`)}
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
