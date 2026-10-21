import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { RepeatIcon } from "lucide-react"

const COMPANIES = ["A", "B", "C", "D"]

/** Today's cost on both sides: a pile of identical resumes, and the same intro call every day. */
export default function ScreeningGrind() {
  const { t } = useTranslation("home")
  const days = t("tension.scene.days", { returnObjects: true })

  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="pop-in rounded-2xl border bg-card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">{t("tension.employer.label")}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {t("tension.scene.resumes")}
          </p>
        </div>
        <ul className="mt-4 grid grid-cols-8 gap-1.5">
          {Array.from({ length: 24 }, (_, index) => (
            <li
              key={index}
              className={cn(
                "flex flex-col gap-1 rounded-md border bg-background p-1.5",
                index >= 16 && "opacity-40"
              )}
            >
              <span className="size-2 rounded-full bg-muted-foreground/25" />
              <span className="h-1 rounded-full bg-muted-foreground/15" />
              <span className="h-1 w-2/3 rounded-full bg-muted-foreground/15" />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {t("tension.scene.alike")}
        </p>
      </div>

      <div className="pop-in rounded-2xl border bg-card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">
            {t("tension.candidate.label")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("tension.scene.week")}
          </p>
        </div>
        <ul className="mt-4 flex flex-col gap-1.5">
          {days.map((day, index) => (
            <li
              key={day}
              className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <span className="w-8 text-xs font-medium text-muted-foreground">
                {day}
              </span>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                {COMPANIES[index]}
              </span>
              <span className="font-medium">{t("tension.scene.call")}</span>
              <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                {t("tension.scene.length")}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-2 text-sm">
          <RepeatIcon className="size-4 shrink-0 text-brand-text" />
          <q className="text-pretty text-muted-foreground italic">
            {t("tension.scene.question")}
          </q>
          <span className="ms-auto shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
            {t("tension.scene.asked")}
          </span>
        </p>
      </div>
    </div>
  )
}
