import type { ReactNode } from "react"
import { Badge } from "@workspace/ui/components/badge"

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

const dotClass: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-brand",
  neutral: "bg-muted-foreground",
}

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone
  children: ReactNode
  className?: string
}) {
  return (
    <Badge variant="outline" className={className}>
      <span className={`size-1.5 rounded-full ${dotClass[tone]}`} />
      {children}
    </Badge>
  )
}
