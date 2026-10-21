import { cn } from "@workspace/ui/lib/utils"

/** A labelled 0–100 bar. `animate` fills it once on load. */
export function Meter({
  label,
  value,
  text = String(value),
  animate,
  className,
}: {
  label: string
  value: number
  text?: string
  animate?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-4", className)}>
      <span className="flex-1 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{text}</span>
      <svg
        aria-hidden
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
        className="mt-2 block h-1.5 w-full basis-full rtl:-scale-x-100"
      >
        <rect width="100" height="4" rx="2" className="fill-muted" />
        <rect
          width={value}
          height="4"
          rx="2"
          className={cn(
            "fill-brand",
            animate && "bar-in [animation-delay:400ms]"
          )}
        />
      </svg>
    </div>
  )
}
