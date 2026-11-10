import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react"
import type { ReactNode } from "react"

import type { CALLOUT_TONES } from "@/lib/blog/remark-guard"

type Tone = (typeof CALLOUT_TONES)[number]

const ICONS = {
  note: InfoIcon,
  tip: LightbulbIcon,
  warning: TriangleAlertIcon,
} satisfies Record<Tone, unknown>

export function Callout({
  tone = "note",
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  const { t } = useTranslation("blog")
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
      <div className="flex min-w-0 flex-col gap-3">
        <span className="sr-only">{t(`mdx.callout.${tone}`)}</span>
        {children}
      </div>
    </aside>
  )
}
