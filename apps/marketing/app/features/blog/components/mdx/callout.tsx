import { cn } from "@workspace/ui/lib/utils"
import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react"
import type { ReactNode } from "react"

const ICONS = {
  note: InfoIcon,
  tip: LightbulbIcon,
  warning: TriangleAlertIcon,
}

export function Callout({
  tone = "note",
  children,
}: {
  tone?: keyof typeof ICONS
  children: ReactNode
}) {
  const Icon = ICONS[tone]
  return (
    <aside
      role="note"
      className={cn(
        "my-2 flex gap-3 rounded-xl border p-4 print:break-inside-avoid",
        tone === "warning" ? "bg-warning-muted" : "bg-muted/40"
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-1 size-5 shrink-0",
          tone === "warning" ? "text-warning" : "text-brand"
        )}
      />
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </aside>
  )
}
