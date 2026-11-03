import { cn } from "@workspace/ui/lib/utils"
import { type ReactNode, useState } from "react"

import { wait } from "@/components/art/delay"

export interface Shot {
  /** Path without the width and extension, e.g. `/images/home-v2/applicants`. */
  src: string
  width: number
  height: number
}

/** An area of the screenshot as percentages: x, y, width, height. */
export type Spot = readonly [x: number, y: number, w: number, h: number]

export function ProductShot({
  shot,
  alt,
  sizes,
  priority,
  className,
  children,
}: {
  shot: Shot
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  children?: ReactNode
}) {
  const set = (ext: string) =>
    `${shot.src}-720.${ext} 720w, ${shot.src}-1440.${ext} 1440w`

  return (
    <figure
      className={cn("rounded-2xl border bg-muted/60 p-1.5 sm:p-2.5", className)}
    >
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <picture>
          <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
          <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
          <img
            src={`${shot.src}-1440.webp`}
            width={shot.width}
            height={shot.height}
            alt={alt}
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
        {children}
      </div>
    </figure>
  )
}

/** A screenshot with numbered spots; pointing at a callout lights its spot. */
export function ExplainedShot({
  callouts,
  spots,
  note,
  onLoad,
  ...shot
}: Omit<Parameters<typeof ProductShot>[0], "children"> & {
  callouts: readonly string[]
  spots: readonly Spot[]
  note?: string
  /** Markers pop on load instead of as they scroll in. */
  onLoad?: boolean
}) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div>
      <ProductShot {...shot}>
        {spots.map(([x, y, w, h], index) => (
          <div
            key={index}
            aria-hidden
            className={cn(
              "pointer-events-none absolute rounded-lg ring-2 ring-primary transition-opacity duration-200 motion-reduce:transition-none",
              active === index ? "opacity-100" : "opacity-0"
            )}
            style={{
              boxShadow:
                "0 0 0 100vmax color-mix(in oklab, var(--color-foreground) 22%, transparent)",
              left: `${String(x)}%`,
              top: `${String(y)}%`,
              width: `${String(w)}%`,
              height: `${String(h)}%`,
            }}
          />
        ))}
        {spots.map(([x, y], index) => (
          <span
            key={index}
            aria-hidden
            className={cn(
              "absolute -translate-1/2 transition-transform duration-200 motion-reduce:transition-none",
              active === index && "scale-125"
            )}
            style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums ring-4 ring-background sm:size-7 sm:text-sm",
                onLoad ? "pop" : "pop-in"
              )}
              style={wait(onLoad ? 500 + index * 120 : 0)}
            >
              {index + 1}
            </span>
          </span>
        ))}
      </ProductShot>

      <ol className="mt-5 grid gap-2 sm:grid-cols-3">
        {callouts.map((item, index) => (
          <li key={item}>
            <button
              type="button"
              aria-pressed={active === index}
              onPointerEnter={() => {
                setActive(index)
              }}
              onPointerLeave={() => {
                setActive(null)
              }}
              onFocus={() => {
                setActive(index)
              }}
              onBlur={() => {
                setActive(null)
              }}
              onClick={() => {
                setActive(active === index ? null : index)
              }}
              className="flex w-full items-start gap-3 rounded-xl p-3 text-start text-pretty transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-brand-muted motion-reduce:transition-none"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-semibold text-brand-text tabular-nums">
                {index + 1}
              </span>
              {item}
            </button>
          </li>
        ))}
      </ol>
      {note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}
