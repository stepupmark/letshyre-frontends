import { Badge } from "@workspace/ui/components/badge"
import type { ReactNode } from "react"

export type Tone = "success" | "warning" | "danger" | "info" | "neutral"

// every pair here is held to 4.5:1 by status-badge.test.ts
export function StatusBadge({
  tone,
  children,
}: {
  tone: Tone
  children: ReactNode
}) {
  return (
    <Badge
      data-tone={tone}
      className="data-[tone=danger]:bg-danger-muted data-[tone=danger]:text-danger data-[tone=info]:bg-info-muted data-[tone=info]:text-info data-[tone=neutral]:bg-secondary data-[tone=neutral]:text-secondary-foreground data-[tone=success]:bg-success-muted data-[tone=success]:text-success data-[tone=warning]:bg-warning-muted data-[tone=warning]:text-warning"
    >
      {children}
    </Badge>
  )
}
