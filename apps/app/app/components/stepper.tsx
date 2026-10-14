import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check } from "lucide-react"

/** Named steps with progress; finished steps are buttons back to themselves. */
export function Stepper({
  titles,
  current,
  onSelect,
}: {
  titles: string[]
  current: number
  onSelect: (index: number) => void
}) {
  const { t } = useTranslation("common")
  // with many steps only the current title fits, the rest would truncate to "A…"
  const roomy = titles.length <= 4

  return (
    <ol aria-label={t("wizard.progress")} className="flex items-center gap-2">
      {titles.map((title, i) => {
        const done = i < current
        const active = i === current
        const label = t(done ? "wizard.itemDone" : "wizard.item", {
          current: i + 1,
          total: titles.length,
          title,
        })
        const body = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums transition-colors duration-300",
                done && "border-primary bg-primary text-primary-foreground",
                active && "ring-once border-primary bg-background text-primary",
                !done && !active && "bg-background text-muted-foreground"
              )}
            >
              {done ? (
                <Check className="pop size-3.5" strokeWidth={3} />
              ) : (
                i + 1
              )}
            </span>
            {(active || roomy) && (
              <span
                aria-hidden="true"
                className={cn(
                  "text-sm",
                  active
                    ? "font-medium whitespace-nowrap"
                    : "truncate text-muted-foreground max-sm:hidden"
                )}
              >
                {title}
              </span>
            )}
            <span className="sr-only">{label}</span>
          </>
        )

        return (
          <li
            key={title}
            aria-current={active ? "step" : undefined}
            title={roomy || active ? undefined : title}
            className={cn(
              "flex items-center gap-2 not-last:flex-1",
              roomy || !active ? "min-w-0" : "shrink-0"
            )}
          >
            {done ? (
              <button
                type="button"
                onClick={() => {
                  onSelect(i)
                }}
                className="flex min-w-0 items-center gap-2 rounded-full pe-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 hover:[&>span:nth-child(2)]:text-foreground"
              >
                {body}
              </button>
            ) : (
              <span className="flex min-w-0 items-center gap-2">{body}</span>
            )}
            {i < titles.length - 1 && (
              <span
                aria-hidden="true"
                className="relative h-px min-w-4 flex-1 overflow-hidden bg-border"
              >
                <span
                  className={cn(
                    "absolute inset-0 origin-left bg-primary transition-transform duration-500 ease-out motion-reduce:transition-none rtl:origin-right",
                    done ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
