import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import type { LucideIcon } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react"

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
  const scroller = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState({ before: false, after: false })

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth
      const at = Math.abs(el.scrollLeft)
      setMore({ before: at > 1, after: at < max - 1 })
    }
    measure()
    el.addEventListener("scroll", measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", measure)
      observer.disconnect()
    }
  }, [])

  return (
    <Tabs
      defaultValue={tabs[0]?.key}
      className="settle min-w-0 gap-0 rounded-lg border bg-card delay-100"
    >
      <div
        ref={scroller}
        data-before={more.before}
        data-after={more.after}
        className="no-scrollbar overflow-x-auto overflow-y-hidden overscroll-x-contain border-b px-2 data-[after=true]:mask-r-from-90% data-[before=true]:mask-l-from-90% data-[after=true]:data-[before=true]:mask-x-from-90% sm:px-4 rtl:data-[after=true]:mask-r-from-100% rtl:data-[after=true]:mask-l-from-90% rtl:data-[before=true]:mask-r-from-90% rtl:data-[before=true]:mask-l-from-100%"
      >
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
              className="h-full flex-none gap-1.5 px-2.5 text-sm after:hidden sm:px-3 data-active:text-brand-text"
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
