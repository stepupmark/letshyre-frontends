import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import type { LucideIcon } from "lucide-react"
import type { FocusEvent, MouseEvent, ReactNode } from "react"

export interface BackgroundTab {
  key: string
  label: string
  icon: LucideIcon
  count?: number
  content: ReactNode
}

const reveal = (event: FocusEvent<HTMLElement> | MouseEvent<HTMLElement>) => {
  event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" })
}

export function BackgroundTabs({
  label,
  tabs,
}: {
  label: string
  tabs: BackgroundTab[]
}) {
  return (
    <Tabs
      defaultValue={tabs[0]?.key}
      className="settle min-w-0 gap-0 rounded-lg border bg-card delay-100"
    >
      <div className="no-scrollbar overflow-x-auto overflow-y-hidden overscroll-x-contain border-b px-2 sm:px-4">
        <TabsList
          variant="line"
          aria-label={label}
          className="relative gap-0 p-0 group-data-horizontal/tabs:h-12"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              onClick={reveal}
              onFocus={reveal}
              className="h-full flex-none gap-2 px-3 text-sm after:hidden sm:px-4 data-active:text-brand-text"
            >
              <tab.icon aria-hidden="true" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
          <BaseTabs.Indicator
            className="absolute bottom-0 h-0.5 rounded-full bg-brand transition-[translate,width] duration-300 ease-out motion-reduce:transition-none"
            style={{
              // Base UI measures the active tab from the physical left, in both directions
              left: 0,
              translate: "var(--active-tab-left) 0",
              width: "var(--active-tab-width)",
            }}
          />
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          keepMounted
          className="p-4 data-hidden:hidden sm:p-6"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
