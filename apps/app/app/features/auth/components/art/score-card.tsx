import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"

export interface Person {
  name: string
  initials: string
  role: string
}

const BARS = ["clarity", "depth", "fit"] as const

/** A candidate's interview result as an employer sees it. */
export function ScoreCard({
  person,
  score,
  bars,
  compact = false,
  className,
}: {
  person: Person
  score: number
  bars?: Record<(typeof BARS)[number], number>
  compact?: boolean
  className?: string
}) {
  const { t } = useTranslation("auth")

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-lg",
        compact ? "w-44 p-3" : "p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-brand-muted font-semibold text-brand-text",
            compact ? "size-8 text-xs" : "size-10 text-sm"
          )}
        >
          {person.initials}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{person.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {person.role}
          </span>
        </span>
        <span
          className={cn(
            "font-display leading-none tabular-nums",
            compact ? "text-2xl" : "text-4xl"
          )}
        >
          {score}
        </span>
      </div>

      {bars && (
        <ul className="mt-5 flex flex-col gap-2.5">
          {BARS.map((key) => (
            <li
              key={key}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)_1.75rem] items-center gap-3 text-xs"
            >
              <span className="text-muted-foreground">
                {t(`art.scores.${key}`)}
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${bars[key]}%` }}
                />
              </span>
              <span className="text-end tabular-nums">{bars[key]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
