import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Plus, Sparkles } from "lucide-react"

/** What the AI interview asks about, marking topics their resume already backs. */
export function Topics({
  role,
  topics,
  onResume,
}: {
  role: string
  topics: string[]
  onResume: (topic: string) => boolean
}) {
  const { t } = useTranslation("candidateOnboarding")
  const matched = topics.filter(onResume).length

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-[radial-gradient(circle_at_100%_0%,var(--brand-muted),transparent_60%)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-muted text-brand-text">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          {t("resume.roleSkills", { role })}
        </p>
        {matched > 0 && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
            <span
              aria-hidden="true"
              className="h-1.5 w-12 overflow-hidden rounded-full bg-muted"
            >
              <span
                className="grow-x block h-full rounded-full bg-success"
                style={{ width: `${(matched / topics.length) * 100}%` }}
              />
            </span>
            {t("resume.onResume", { count: matched, total: topics.length })}
          </p>
        )}
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {topics.map((topic, i) => {
          const backed = onResume(topic)
          return (
            <li
              key={topic}
              style={{ animationDelay: `${i * 50}ms` }}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium motion-safe:animate-in motion-safe:fill-mode-both motion-safe:zoom-in-95 motion-safe:fade-in",
                backed
                  ? "border-success/30 bg-success/10 text-success"
                  : "bg-card"
              )}
            >
              {backed && (
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              )}
              {topic}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function RoleOption({
  label,
  tag,
  other = false,
  checked,
  focusable,
  onSelect,
}: {
  label: string
  tag?: string
  other?: boolean
  checked: boolean
  focusable: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={focusable ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-[background-color,border-color,box-shadow] duration-200 outline-none hover:border-foreground/20 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
        other && !checked && "border-dashed",
        checked &&
          "border-brand bg-brand-muted/50 font-medium shadow-[0_6px_16px_-8px_color-mix(in_oklab,var(--brand)_45%,transparent)] hover:border-brand hover:bg-brand-muted/50"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border transition-colors motion-reduce:transition-none",
          checked && "border-brand"
        )}
      >
        {checked && <span className="pop size-2 rounded-full bg-brand" />}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
      {other ? (
        <Plus
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      ) : (
        tag && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-[0.6875rem] font-medium text-brand-text">
            <Sparkles className="size-3" aria-hidden="true" />
            {tag}
          </span>
        )
      )}
    </button>
  )
}
