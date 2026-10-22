import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown } from "lucide-react"
import { useId, useState, type ReactNode } from "react"

/** A filter section; collapsed, it shows what's picked in one line. */
export function Group({
  id,
  title,
  aside,
  summary,
  defaultOpen = true,
  children,
}: {
  id?: string
  title: string
  aside?: ReactNode
  summary?: string | null
  defaultOpen?: boolean
  children: ReactNode
}) {
  const ownId = useId()
  const bodyId = useId()
  const titleId = id ?? ownId
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="flex flex-col gap-2.5 py-4 first:pt-0 last:pb-0"
    >
      <div className="flex min-h-7 items-center justify-between gap-2">
        <h3 id={titleId} className="min-w-0 text-sm font-semibold">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => {
              setOpen(!open)
            }}
            className="flex items-center gap-1.5 rounded-sm text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                !open && "-rotate-90 rtl:rotate-90"
              )}
            />
            {title}
          </button>
        </h3>
        {open
          ? aside
          : summary && (
              <span className="min-w-0 truncate text-xs text-muted-foreground">
                {summary}
              </span>
            )}
      </div>
      {open && (
        <div id={bodyId} className="flex flex-col gap-2">
          {children}
        </div>
      )}
    </div>
  )
}

export function Option({ children }: { children: ReactNode }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md text-sm transition-colors hover:text-foreground has-data-checked:font-medium max-lg:min-h-11">
      {children}
    </label>
  )
}

export function ResetButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation("candidateJobs")
  return (
    <Button
      variant="link"
      size="xs"
      className="h-auto px-0 text-xs"
      onClick={onClick}
    >
      {t("filters.reset")}
    </Button>
  )
}
