import { cn } from "@workspace/ui/lib/utils"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"
import { bandOf } from "@/lib/score-band"

// decorative: the band badge beside it carries the meaning
export function MatchMeter({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-1.5 overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <span
        className="block h-full"
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      >
        <m.span
          data-band={bandOf(score)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: duration.slow, ease }}
          className="block h-full origin-left rounded-full bg-muted-foreground/50 data-[band=partial]:bg-warning data-[band=strong]:bg-success rtl:origin-right"
        />
      </span>
    </span>
  )
}
