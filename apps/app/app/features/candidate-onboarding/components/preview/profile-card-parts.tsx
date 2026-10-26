import { cn } from "@workspace/ui/lib/utils"
import type { Camera } from "lucide-react"
import type { ReactNode } from "react"

// stops on the route, in a 320 x 96 box, clear of the avatar; the curve passes through each one
const STOPS = [
  { x: 132, y: 42 },
  { x: 184, y: 22 },
  { x: 236, y: 46 },
  { x: 288, y: 26 },
]

const ROUTE = `M-20 80 Q64 62 ${STOPS.map((s) => `${s.x} ${s.y}`).join(" T ")} T 360 40`

/** Home city first, then the places they'd work, as stops on one route. */
export function Route({
  home,
  places,
  active,
}: {
  home: string
  places: string[]
  active: boolean
}) {
  const all = [
    home,
    ...places.filter((p) => p.toLowerCase() !== home.toLowerCase()),
  ].filter(Boolean)
  const stops = all.slice(0, STOPS.length)
  const extra = all.length - stops.length

  return (
    <div
      className={cn(
        "relative h-24 overflow-hidden bg-brand-muted/50 bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand)_18%,transparent)_1px,transparent_1px)] bg-size-[14px_14px] transition-colors duration-300 motion-reduce:transition-none",
        active && "bg-brand-muted"
      )}
    >
      <svg
        viewBox="0 0 320 96"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        <path
          d={ROUTE}
          fill="none"
          strokeWidth={2}
          strokeDasharray="4 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-brand/35"
        />
      </svg>
      {STOPS.map((pos, i) => {
        const label = stops[i] ?? ""
        return (
          <div
            key={i}
            style={{
              left: `${(pos.x / 320) * 100}%`,
              top: `${(pos.y / 96) * 100}%`,
            }}
            className="absolute flex -translate-1/2 flex-col items-center"
          >
            <span
              className={cn(
                "grid place-items-center rounded-full border-2 border-dashed border-brand/30 bg-card",
                i === 0 && home ? "size-4" : "size-3",
                label && "pop border-solid border-brand",
                label && i === 0 && home && "bg-brand"
              )}
            />
            {label && (
              <span className="absolute top-full mt-1 max-w-14 truncate rounded-full bg-card/90 px-1.5 text-[0.625rem] font-medium shadow-xs motion-safe:animate-in motion-safe:fade-in">
                {i === 3 && extra > 0 ? `${label} +${extra}` : label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Photo or initials, ringed by how much of the profile is filled. */
export function Avatar({
  done,
  label,
  highlight,
  children,
}: {
  done: number
  label: string
  highlight: boolean
  children: ReactNode
}) {
  return (
    <div className="relative grid size-20 shrink-0 place-items-center rounded-full bg-card">
      <svg viewBox="0 0 80 80" aria-hidden="true" className="absolute inset-0">
        <circle
          cx={40}
          cy={40}
          r={37}
          strokeWidth={3}
          className="fill-none stroke-muted"
        />
        <circle
          cx={40}
          cy={40}
          r={37}
          pathLength={1}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - done}
          className={cn(
            "origin-center -rotate-90 fill-none transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none",
            done === 1 ? "stroke-success" : "stroke-brand",
            done === 0 && "opacity-0"
          )}
        />
      </svg>
      <div
        className={cn(
          "grid size-16 place-items-center overflow-hidden rounded-full bg-brand-muted text-lg font-semibold text-brand-text",
          highlight && "ring-2 ring-brand/40"
        )}
      >
        {children}
      </div>
      <span className="absolute -inset-e-1 bottom-0 rounded-full border bg-card px-1.5 text-[0.625rem] font-semibold tabular-nums shadow-xs">
        {label}
      </span>
    </div>
  )
}

export function Section({
  active,
  muted = false,
  children,
}: {
  active: boolean
  muted?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b p-5 transition-colors duration-300 last:border-b-0 motion-reduce:transition-none",
        muted && "bg-muted/30",
        active && "bg-brand-muted/40"
      )}
    >
      {children}
    </div>
  )
}

export function Stamp({
  icon: Icon,
  done,
  children,
}: {
  icon: typeof Camera
  done: boolean
  children: ReactNode
}) {
  return (
    <li
      className={cn(
        "flex flex-col items-center gap-1.5",
        done ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full border border-dashed transition-colors duration-300 motion-reduce:transition-none",
          done && "border-solid border-success/40 bg-success/10 text-success"
        )}
      >
        <Icon key={String(done)} className={cn("size-4", done && "pop")} />
      </span>
      {children}
    </li>
  )
}

export function Bar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block h-2.5 rounded-full bg-muted-foreground/15",
        className
      )}
    />
  )
}
