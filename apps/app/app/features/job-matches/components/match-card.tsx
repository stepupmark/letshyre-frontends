import { ChevronRight } from "lucide-react"
import { useId } from "react"

import type { Match } from "../schemas/job-matches.schema"
import { MatchBreakdown } from "./match-breakdown"
import { MatchPerson } from "./match-person"

export function MatchCard({
  match,
  onOpen,
}: {
  match: Match
  onOpen: () => void
}) {
  const id = useId()
  const reason = match.ai_match?.rationale
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-labelledby={`${id}-person`}
      aria-describedby={reason ? `${id}-reason` : undefined}
      className="group flex w-full flex-col gap-3 rounded-lg border bg-card p-4 text-start transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted"
    >
      <span className="flex w-full items-center justify-between gap-3">
        <span id={`${id}-person`} className="flex min-w-0 items-center gap-3">
          <MatchPerson match={match} />
        </span>
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-active:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100"
        />
      </span>
      <MatchBreakdown match={match} />
      {reason && (
        <span
          id={`${id}-reason`}
          className="line-clamp-2 text-xs text-pretty text-muted-foreground"
        >
          {reason}
        </span>
      )}
    </button>
  )
}
