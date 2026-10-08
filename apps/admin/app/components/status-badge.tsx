import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral"

const dotClass: Record<StatusTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  info: "bg-sky-500",
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
