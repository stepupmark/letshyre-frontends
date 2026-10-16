import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"

interface Interview {
  label: string
  role: string
}

/** The three interview attempts, each ending in a scorecard. */
export function AttemptTracker({ className }: { className?: string }) {
  const { t } = useTranslation("home")
  const interviews = t("professionals.interviews", {
    returnObjects: true,
  }) as Interview[]

  return (
    <ol
      className={cn(
        "reveal mx-auto flex w-full max-w-md flex-col rounded-2xl border bg-card p-3 sm:p-4",
        className
      )}
    >
      {interviews.map((interview, index) => (
        <li
          key={interview.label}
          className="relative flex items-center gap-4 rounded-xl p-3 sm:p-4"
        >
          {index < interviews.length - 1 && (
            <span
              aria-hidden
              className="absolute inset-s-8 top-14 -bottom-4 w-px bg-border sm:inset-s-9 sm:top-15"
            />
          )}
          <span
            aria-hidden
            className="pop-in flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand-text tabular-nums"
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{interview.label}</p>
            <p className="text-sm text-muted-foreground">{interview.role}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand/30 bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand-text">
            <CheckIcon aria-hidden className="size-3" />
            {t("professionals.scorecard")}
          </span>
        </li>
      ))}
    </ol>
  )
}
