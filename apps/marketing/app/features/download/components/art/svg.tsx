import { cn } from "@workspace/ui/lib/utils"
import { Check, type LucideIcon } from "lucide-react"

import { wait } from "./delay"

/** A line of text, sketched. */
export function Line({
  x,
  y,
  width,
  strong = false,
  className,
}: {
  x: number
  y: number
  width: number
  strong?: boolean
  className?: string
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={strong ? 7 : 6}
      rx={3}
      className={cn(
        strong ? "fill-foreground/55" : "fill-muted-foreground/25",
        className
      )}
    />
  )
}

export function IconDot({
  cx,
  cy,
  r,
  icon: Icon,
}: {
  cx: number
  cy: number
  r: number
  icon: LucideIcon
}) {
  const size = r * 1.1
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className="fill-brand-muted" />
      <Icon
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        strokeWidth={2}
        className="text-brand-text"
      />
    </g>
  )
}

export function Tick({
  cx,
  cy,
  r,
  delay,
  className,
}: {
  cx: number
  cy: number
  r: number
  delay?: number
  className?: string
}) {
  const size = r * 1.1
  return (
    <g className={cn("pop", className)} style={wait(delay)}>
      <circle cx={cx} cy={cy} r={r} className="fill-primary" />
      <Check
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        strokeWidth={3}
        className="text-primary-foreground"
      />
    </g>
  )
}
