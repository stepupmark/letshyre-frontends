import { cn } from "@workspace/ui/lib/utils"

export interface Shot {
  /** Path without the width and extension, e.g. `/images/home-v2/applicants`. */
  src: string
  width: number
  height: number
}

/** Where each numbered marker sits, as percentages of the screenshot. */
export type Marker = readonly [x: number, y: number]

export function ProductShot({
  shot,
  alt,
  sizes,
  markers = [],
  priority,
  className,
}: {
  shot: Shot
  alt: string
  sizes: string
  markers?: readonly Marker[]
  priority?: boolean
  className?: string
}) {
  const set = (ext: string) =>
    `${shot.src}-720.${ext} 720w, ${shot.src}-1440.${ext} 1440w`

  return (
    <figure
      className={cn("overflow-hidden rounded-2xl border bg-card", className)}
    >
      <div aria-hidden className="flex gap-1.5 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      </div>
      <div className="relative">
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
        {markers.map(([x, y], index) => (
          <span
            key={index}
            aria-hidden
            className="absolute flex size-6 -translate-1/2 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums ring-4 ring-primary/20 sm:size-7 sm:text-sm"
            style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
          >
            {index + 1}
          </span>
        ))}
      </div>
    </figure>
  )
}

export function Callouts({
  items,
  className,
}: {
  items: readonly string[]
  className?: string
}) {
  return (
    <ol className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {items.map((item, index) => (
        <li key={item} className="flex items-start gap-3 text-pretty">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-semibold text-brand-text tabular-nums">
            {index + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  )
}
