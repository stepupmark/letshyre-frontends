import { cn } from "@workspace/ui/lib/utils"
import { Check, type LucideIcon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

const delay = (ms = 0): CSSProperties => ({
  transitionDelay: `${ms}ms`,
  animationDelay: `${ms}ms`,
})

/** A surface in a scene; it rises into place after `wait` ms. */
export function Panel({
  x,
  y,
  width,
  height,
  wait,
  children,
}: {
  x: number
  y: number
  width: number
  height: number
  wait?: number
  children?: ReactNode
}) {
  return (
    <g className="settle" style={delay(wait)}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={16}
        className="drop-shadow-raised fill-card stroke-border"
      />
      {children}
    </g>
  )
}

/** A line of text, sketched. */
export function Line({
  x,
  y,
  width,
  strong = false,
}: {
  x: number
  y: number
  width: number
  strong?: boolean
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={strong ? 7 : 6}
      rx={3}
      className={strong ? "fill-foreground/55" : "fill-muted-foreground/25"}
    />
  )
}

export function IconDot({
  cx,
  cy,
  r = 18,
  icon: Icon,
  className,
}: {
  cx: number
  cy: number
  r?: number
  icon: LucideIcon
  className?: string
}) {
  const size = r * 1.05
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className={cn("fill-brand-muted", className)}
      />
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
  r = 12,
  wait,
  className,
}: {
  cx: number
  cy: number
  r?: number
  wait?: number
  className?: string
}) {
  const size = r * 1.1
  return (
    <g className={cn("pop", className)} style={delay(wait)}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className="fill-primary stroke-card"
        strokeWidth={2}
      />
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

/** An interview score, the arc filling on arrival. */
export function ScoreRing({
  cx,
  cy,
  r,
  value,
}: {
  cx: number
  cy: number
  r: number
  value: number
}) {
  const arc = value / 100
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={6}
        className="fill-none stroke-muted"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={6}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${arc} 1`}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="ring-fill fill-none stroke-brand"
        style={{ "--ring": arc } as CSSProperties}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[17px] font-semibold tabular-nums"
      >
        {value}
      </text>
    </g>
  )
}

/** A bar that grows from its start; `vertical` grows upwards. */
export function Bar({
  x,
  y,
  width,
  height,
  vertical = false,
  wait,
  className,
}: {
  x: number
  y: number
  width: number
  height: number
  vertical?: boolean
  wait?: number
  className?: string
}) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={Math.min(width, height) / 2}
      className={cn(vertical ? "grow-up" : "grow-x", className)}
      style={delay(wait)}
    />
  )
}

/** Anything else in a scene that should rise in after `wait` ms. */
export function Rise({
  wait,
  className,
  children,
}: {
  wait?: number
  className?: string
  children: ReactNode
}) {
  return (
    <g className={cn("settle", className)} style={delay(wait)}>
      {children}
    </g>
  )
}
