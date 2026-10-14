import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

/** A small desktop window the scenes play inside. */
export function Frame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border bg-card shadow-[0_16px_40px_-24px_color-mix(in_oklab,var(--brand)_45%,transparent)]"
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-2">
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
      </div>
      <div
        className={cn(
          "relative grid aspect-4/3 place-items-center bg-brand-muted/30 bg-[radial-gradient(circle,color-mix(in_oklab,var(--brand)_14%,transparent)_1px,transparent_1px)] bg-size-[14px_14px] p-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Plays an entrance once while `play` is on; otherwise shows the end state,
 * which is also what reduced motion gets.
 */
export function Enter({
  play,
  delay = 0,
  from = "fade",
  className,
  children,
}: {
  play: boolean
  delay?: number
  from?: "fade" | "up" | "down" | "pop" | "start"
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      style={play ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(
        play &&
          "motion-safe:animate-in motion-safe:duration-500 motion-safe:ease-out motion-safe:fill-mode-both motion-safe:fade-in",
        play && from === "up" && "motion-safe:slide-in-from-bottom-3",
        play && from === "down" && "motion-safe:slide-in-from-top-6",
        play && from === "pop" && "motion-safe:zoom-in-50",
        play && from === "start" && "motion-safe:slide-in-from-start-4",
        className
      )}
    >
      {children}
    </div>
  )
}

/** A grey stand-in for text, so scenes read as UI without real copy. */
export const Line = ({ className }: { className?: string }) => (
  <span
    className={cn("block h-1.5 rounded-full bg-foreground/10", className)}
  />
)
