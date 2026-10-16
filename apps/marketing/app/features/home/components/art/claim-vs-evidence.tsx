import { useTranslation } from "@workspace/i18n/react"
import { ArrowDownIcon, BadgeCheckIcon } from "lucide-react"

/** A resume claim, crossed out, and the interview score that replaces it. */
export function ClaimVsEvidence() {
  const { t } = useTranslation("home")

  return (
    <figure
      aria-hidden
      className="reveal mx-auto flex w-full max-w-md flex-col items-center lg:me-0"
    >
      <div className="w-full rounded-2xl border bg-card p-6 sm:p-7">
        <div className="flex flex-col gap-2">
          <span className="h-2 w-1/3 rounded-full bg-muted" />
          <span className="h-1.5 w-11/12 rounded-full bg-muted" />
          <span className="h-1.5 w-4/5 rounded-full bg-muted" />
        </div>
        <p className="mt-5 text-lg text-muted-foreground line-through decoration-brand decoration-2">
          {t("tension.claim")}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <span className="h-1.5 w-full rounded-full bg-muted" />
          <span className="h-1.5 w-2/3 rounded-full bg-muted" />
        </div>
      </div>

      <span className="pop-in my-3 flex size-9 items-center justify-center rounded-full border bg-background text-brand-text">
        <ArrowDownIcon className="size-4" />
      </span>

      <div className="reveal flex w-full items-center gap-4 rounded-2xl border border-brand/30 bg-brand-muted p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <BadgeCheckIcon className="size-5" />
        </span>
        <p className="text-lg font-semibold text-pretty text-brand-text">
          {t("tension.correction")}
        </p>
      </div>
    </figure>
  )
}
