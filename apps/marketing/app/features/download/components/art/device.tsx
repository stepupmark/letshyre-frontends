import type { DesktopOs } from "@workspace/api/public"
import { cn } from "@workspace/ui/lib/utils"

/** A desktop for Windows, a laptop for macOS; the screen lights up when there's a build. */
export function Device({ os, ready }: { os: DesktopOs; ready: boolean }) {
  const laptop = os === "mac"
  const screen = laptop
    ? { x: 14, y: 6, width: 68, height: 46 }
    : { x: 8, y: 4, width: 80, height: 50 }

  return (
    <svg
      viewBox="0 0 96 72"
      aria-hidden="true"
      className="w-20 shrink-0 transition-transform duration-300 group-hover/release:-translate-y-0.5 motion-reduce:transition-none"
    >
      <rect
        {...screen}
        rx={6}
        strokeWidth={2}
        className="fill-card stroke-foreground/20"
      />
      <rect
        x={screen.x + 6}
        y={screen.y + 6}
        width={screen.width - 12}
        height={screen.height - 12}
        rx={3}
        className={cn(
          "transition-colors duration-500",
          ready ? "fill-brand-muted" : "fill-muted"
        )}
      />
      {ready ? (
        <g className="pop">
          <rect
            x={screen.x + 12}
            y={screen.y + 12}
            width={screen.width / 2 - 8}
            height={5}
            rx={2.5}
            className="fill-brand-text/60"
          />
          <rect
            x={screen.x + 12}
            y={screen.y + screen.height - 22}
            width={22}
            height={8}
            rx={4}
            className="fill-primary"
          />
        </g>
      ) : (
        <rect
          x={screen.x + 12}
          y={screen.y + 12}
          width={screen.width / 3}
          height={5}
          rx={2.5}
          className="fill-muted-foreground/25"
        />
      )}
      {laptop ? (
        <>
          <rect
            x={4}
            y={54}
            width={88}
            height={6}
            rx={3}
            className="fill-foreground/20"
          />
          <rect
            x={40}
            y={54}
            width={16}
            height={2}
            rx={1}
            className="fill-card"
          />
        </>
      ) : (
        <>
          <rect
            x={42}
            y={54}
            width={12}
            height={8}
            className="fill-foreground/20"
          />
          <rect
            x={30}
            y={62}
            width={36}
            height={4}
            rx={2}
            className="fill-foreground/20"
          />
        </>
      )}
    </svg>
  )
}
