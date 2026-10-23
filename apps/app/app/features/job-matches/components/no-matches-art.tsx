import type { CSSProperties } from "react"

const wait = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

export function NoMatchesArt() {
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" className="w-56">
      {[0, 1, 2].map((i) => (
        <g key={i} className="settle" style={wait(i * 120)}>
          <rect
            x={30 + i * 62}
            y={34}
            width={54}
            height={70}
            rx={12}
            className="fill-card stroke-border"
          />
          <circle
            cx={57 + i * 62}
            cy={60}
            r={11}
            className="fill-brand-muted"
          />
          <rect
            x={42 + i * 62}
            y={80}
            width={30}
            height={5}
            rx={2.5}
            className="fill-muted-foreground/25"
          />
          <rect
            x={46 + i * 62}
            y={90}
            width={22}
            height={4}
            rx={2}
            className="fill-muted-foreground/15"
          />
        </g>
      ))}
      <g className="pop" style={wait(500)}>
        <circle
          cx={176}
          cy={44}
          r={18}
          className="fill-background stroke-brand"
          strokeWidth={3}
        />
        <path
          d="M 189 57 L 202 70"
          className="stroke-brand"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
