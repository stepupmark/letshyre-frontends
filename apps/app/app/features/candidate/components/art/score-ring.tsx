import type { CSSProperties, ReactNode } from "react"

const R = 52
const C = 2 * Math.PI * R
const TICKS = Array.from({ length: 10 }, (_, i) => i * 36)

export function ScoreRing({
  score,
  label,
  children,
}: {
  score: number
  label: string
  children?: ReactNode
}) {
  const clamped = Math.min(100, Math.max(0, score))
  const dash = (clamped / 100) * C

  return (
    <div role="img" aria-label={label} className="relative size-40 shrink-0">
      <svg viewBox="0 0 120 120" aria-hidden className="size-full -rotate-90">
        <circle
          cx={60}
          cy={60}
          r={R}
          strokeWidth={8}
          className="fill-none stroke-muted"
        />
        {TICKS.map((angle) => (
          <line
            key={angle}
            x1={60 + 40 * Math.cos((angle * Math.PI) / 180)}
            y1={60 + 40 * Math.sin((angle * Math.PI) / 180)}
            x2={60 + 43 * Math.cos((angle * Math.PI) / 180)}
            y2={60 + 43 * Math.sin((angle * Math.PI) / 180)}
            strokeWidth={1.5}
            strokeLinecap="round"
            className="stroke-border"
          />
        ))}
        <circle
          cx={60}
          cy={60}
          r={R}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ "--ring": dash } as CSSProperties}
          className="ring-fill fill-none stroke-brand print:animate-none"
        />
      </svg>
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        {children}
      </div>
    </div>
  )
}
