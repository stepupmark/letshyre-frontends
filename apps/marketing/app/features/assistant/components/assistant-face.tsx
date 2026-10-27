import { cn } from "@workspace/ui/lib/utils"

export const BUBBLE_PATH =
  "M32 6a24 24 0 1 0 15.5 42.3L56 54l-4.4-10.2A24 24 0 0 0 32 6Z"

/** The launcher's face, still, so the panel shows the same character. */
export function AssistantFace({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className={cn("shrink-0 rtl:-scale-x-100", className)}
    >
      <path d={BUBBLE_PATH} className="fill-primary" />
      <rect
        x="22"
        y="24"
        width="5"
        height="11"
        rx="2.5"
        className="fill-primary-foreground"
      />
      <rect
        x="37"
        y="24"
        width="5"
        height="11"
        rx="2.5"
        className="fill-primary-foreground"
      />
    </svg>
  )
}
