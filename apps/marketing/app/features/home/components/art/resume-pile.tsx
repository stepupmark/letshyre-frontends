import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CircleHelpIcon } from "lucide-react"

/** The unproven starting point: loose resumes making claims nobody has checked. */
export function ResumePile({ className }: { className?: string }) {
  const { t } = useTranslation("home")
  const claims = t("hero.scene.claims", { returnObjects: true })

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 -translate-x-3 translate-y-2 -rotate-9 rounded-xl border bg-muted max-sm:hidden rtl:translate-x-3 rtl:rotate-9" />
      <div className="absolute inset-0 -translate-x-1 translate-y-1 -rotate-4 rounded-xl border bg-muted rtl:translate-x-1 rtl:rotate-4" />
      <div className="relative rotate-3 rounded-xl border bg-card p-4 rtl:-rotate-3">
        <span className="block h-2 w-1/2 rounded-full bg-foreground/20" />
        <span className="mt-2 block h-1.5 w-1/3 rounded-full bg-muted" />
        <ul className="mt-3 flex flex-col gap-2">
          {claims.map((claim, index) => (
            <li
              key={claim}
              className={cn(
                "flex items-center justify-between gap-2 text-sm text-muted-foreground",
                index > 1 && "max-sm:hidden"
              )}
            >
              <q className="truncate">{claim}</q>
              <CircleHelpIcon className="size-4 shrink-0 text-muted-foreground/60" />
            </li>
          ))}
        </ul>
        <span className="mt-3 block h-1.5 w-11/12 rounded-full bg-muted" />
        <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-muted" />
      </div>
    </div>
  )
}
