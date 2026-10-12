import { cn } from "@workspace/ui/lib/utils"
import { Eye, Lock, LockOpen } from "lucide-react"

import { Line } from "@/components/art/svg"

const VIEW = "0 0 240 140"
const ROWS = [26, 62, 98]
const REACH = [
  { height: 14, rest: "scale-y-45" },
  { height: 22, rest: "scale-y-55" },
  { height: 30, rest: "scale-y-65" },
  { height: 40, rest: "scale-y-75" },
]

/** A shortlist where hovering the card unlocks the middle candidate. */
export function EmployerArt() {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full">
      {ROWS.map((y, i) => {
        const picked = i === 1
        return (
          <g key={y}>
            <rect
              x={24}
              y={y}
              width={192}
              height={28}
              rx={8}
              className={
                picked
                  ? "fill-card stroke-border transition-colors duration-300 group-hover/audience:fill-brand-muted group-hover/audience:stroke-brand/40"
                  : "fill-card stroke-border"
              }
            />
            <circle cx={42} cy={y + 14} r={8} className="fill-brand-muted" />
            <Line x={58} y={y + 7} width={picked ? 80 : 64} strong />
            <Line x={58} y={y + 17} width={picked ? 52 : 44} />
            {picked ? (
              <>
                <Lock
                  x={190}
                  y={y + 7}
                  width={14}
                  height={14}
                  strokeWidth={2}
                  className="text-muted-foreground transition-opacity duration-300 group-hover/audience:opacity-0 motion-reduce:transition-none"
                />
                <LockOpen
                  x={190}
                  y={y + 7}
                  width={14}
                  height={14}
                  strokeWidth={2}
                  className="text-brand-text opacity-0 transition-opacity duration-300 group-hover/audience:opacity-100 motion-reduce:transition-none"
                />
              </>
            ) : (
              <Lock
                x={190}
                y={y + 7}
                width={14}
                height={14}
                strokeWidth={2}
                className="text-muted-foreground/60"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** A profile whose reach grows when the card is hovered. */
export function CandidateArt() {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full">
      <rect
        x={24}
        y={22}
        width={124}
        height={96}
        rx={12}
        className="fill-card stroke-border"
      />
      <circle cx={52} cy={50} r={14} className="fill-brand-muted" />
      <Line x={74} y={42} width={56} strong />
      <Line x={74} y={54} width={40} />
      <Line x={40} y={78} width={92} />
      <Line x={40} y={92} width={72} />
      <rect
        x={160}
        y={22}
        width={56}
        height={96}
        rx={12}
        className="fill-card stroke-border"
      />
      <Eye
        x={180}
        y={32}
        width={16}
        height={16}
        strokeWidth={2}
        className="text-brand-text"
      />
      {REACH.map(({ height, rest }, i) => (
        <rect
          key={height}
          x={172 + i * 9}
          y={106 - height}
          width={6}
          height={height}
          rx={3}
          className={cn(
            "origin-bottom fill-brand transition-[scale] duration-500 ease-out transform-fill group-hover/audience:scale-y-100 motion-reduce:transition-none",
            rest
          )}
        />
      ))}
    </svg>
  )
}
