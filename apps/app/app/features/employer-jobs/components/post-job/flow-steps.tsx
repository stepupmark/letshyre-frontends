import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check } from "lucide-react"

const STEPS = ["upload", "read", "review"] as const

/** Where the employer is in posting; not clickable, since going back means starting over. */
export function FlowSteps({ current }: { current: number }) {
  const { t } = useTranslation(["jobs", "common"])
  return (
    <ol
      aria-label={t("post.steps.label")}
      className="flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        const title = t(`post.steps.${step}`)
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-colors duration-300",
                done && "border-brand bg-brand text-primary-foreground",
                active && "ring-once border-brand text-brand-text",
                !done && !active && "text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="pop size-3.5" strokeWidth={3} />
              ) : (
                i + 1
              )}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                active
                  ? "font-medium text-brand-text"
                  : "text-muted-foreground max-sm:hidden"
              )}
            >
              {title}
            </span>
            <span className="sr-only">
              {t(done ? "common:wizard.itemDone" : "common:wizard.item", {
                current: i + 1,
                total: STEPS.length,
                title,
              })}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="h-px w-6 bg-border sm:w-10" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
