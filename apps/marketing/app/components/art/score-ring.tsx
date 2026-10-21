import { cn } from "@workspace/ui/lib/utils"

/** The arc from 12 o'clock, clockwise, for a 0–100 score on a 64-unit ring. */
const arc = (score: number) => {
  const angle = (Math.min(score, 99.9) / 100) * 2 * Math.PI
  const x = (32 + 28 * Math.sin(angle)).toFixed(2)
  const y = (32 - 28 * Math.cos(angle)).toFixed(2)
  return `M32 4A28 28 0 ${score > 50 ? 1 : 0} 1 ${x} ${y}`
}

export function ScoreRing({
  score,
  caption,
  compact,
  className,
}: {
  score: number
  caption?: string
  compact?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0",
        compact ? "size-16" : "size-20",
        className
      )}
    >
      <svg aria-hidden viewBox="0 0 64 64" fill="none" className="size-full">
        <circle
          cx="32"
          cy="32"
          r="28"
          strokeWidth="6"
          className="stroke-muted"
        />
        <path
          pathLength={1}
          d={arc(score)}
          strokeWidth="6"
          strokeLinecap="round"
          className="ink stroke-brand"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center tabular-nums">
        <span
          className={cn(
            "font-semibold",
            compact ? "text-xl/none" : "text-2xl/none"
          )}
        >
          {score}
        </span>
        {caption && (
          <span className="text-xs text-muted-foreground">{caption}</span>
        )}
      </span>
    </span>
  )
}
