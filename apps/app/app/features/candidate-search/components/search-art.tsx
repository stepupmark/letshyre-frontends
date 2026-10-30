import type { CSSProperties } from "react"

const wait = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

export function SearchArt() {
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" className="w-56">
      {[0, 1, 2].map((i) => (
        <g key={i} className="settle" style={wait(i * 100)}>
          <rect
            x={34}
            y={22 + i * 34}
            width={150}
            height={28}
            rx={8}
            className="fill-card stroke-border"
          />
          <circle
            cx={50}
            cy={36 + i * 34}
            r={7}
            className={i === 1 ? "fill-brand" : "fill-brand-muted"}
          />
          <rect
            x={64}
            y={30 + i * 34}
            width={i === 1 ? 70 : 54}
            height={5}
            rx={2.5}
            className={i === 1 ? "fill-brand/60" : "fill-muted-foreground/25"}
          />
          <rect
            x={64}
            y={39 + i * 34}
            width={40}
            height={4}
            rx={2}
            className="fill-muted-foreground/15"
          />
        </g>
      ))}
      <g className="pop" style={wait(450)}>
        <circle
          cx={176}
          cy={70}
          r={20}
          className="fill-background/70 stroke-brand"
          strokeWidth={3}
        />
        <path
          d="M 190 84 L 204 98"
          className="stroke-brand"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
