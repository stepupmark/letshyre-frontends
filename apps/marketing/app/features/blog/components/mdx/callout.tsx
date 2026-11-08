import { InfoIcon, LightbulbIcon } from "lucide-react"
import type { ReactNode } from "react"

export function Callout({
  tone = "note",
  children,
}: {
  tone?: "note" | "tip"
  children: ReactNode
}) {
  const Icon = tone === "tip" ? LightbulbIcon : InfoIcon
  return (
    <aside
      role="note"
      className="my-2 flex gap-3 rounded-xl border bg-muted/40 p-4"
    >
      <Icon aria-hidden className="mt-1 size-5 shrink-0 text-brand" />
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </aside>
  )
}
