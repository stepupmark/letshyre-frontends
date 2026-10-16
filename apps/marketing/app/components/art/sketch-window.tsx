import type { ReactNode } from "react"

/** A 240 × 170 app window for a sketched screen; content draws below y = 33. */
export function SketchWindow({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 170" aria-hidden="true" className="w-full">
      <rect
        x={6}
        y={6}
        width={228}
        height={158}
        rx={12}
        className="fill-card stroke-border"
      />
      {[20, 30, 40].map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={19}
          r={3}
          className="fill-muted-foreground/25"
        />
      ))}
      <rect x={6} y={32} width={228} height={1} className="fill-border" />
      {children}
    </svg>
  )
}
