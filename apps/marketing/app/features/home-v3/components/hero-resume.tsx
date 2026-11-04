import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { FileTextIcon } from "lucide-react"

/** Vyshnavi's resume; `slot` leaves room at the top for the photo to land in. */
export function HeroResume({
  progress,
  slot,
}: {
  progress: MotionValue<number>
  slot?: boolean
}) {
  const { t } = useTranslation("homeV3")
  const reveal = useTransform(progress, [0.45, 0.65], [0, 1])
  const rise = useTransform(reveal, [0, 1], ["1rem", "0rem"])
  const note = useTransform(progress, [0.7, 0.85], [0, 1])

  return (
    <div
      role="img"
      aria-label={t("hero.resume.label")}
      className={cn(
        "flex flex-col gap-5 rounded-3xl border bg-card p-5",
        slot && "absolute inset-0"
      )}
    >
      <m.div style={{ opacity: reveal }} className="flex items-start gap-4">
        {slot ? <span className="h-20 w-16 shrink-0" /> : null}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileTextIcon className="size-3.5" />
            {t("hero.resume.kicker")}
          </p>
          <p className="mt-1 truncate text-lg font-semibold">
            {t("hero.resume.name")}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {t("hero.resume.role")}
          </p>
        </div>
      </m.div>
      <m.div style={{ opacity: reveal, y: rise }} className="grid gap-5">
        <p className="text-sm text-pretty">{t("hero.resume.summary")}</p>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("hero.resume.skills")}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {t("hero.resume.claims", { returnObjects: true }).map((claim) => (
              <li
                key={claim}
                className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {claim}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("hero.resume.experience")}
          </p>
          <ul className="mt-2 grid gap-2 text-sm">
            {t("hero.resume.jobs", { returnObjects: true }).map((job) => (
              <li key={job.title} className="flex justify-between gap-3">
                <span className="truncate">{job.title}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {job.dates}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </m.div>
      <m.p
        style={{ opacity: note }}
        className="mt-auto border-t pt-4 text-sm font-medium text-pretty"
      >
        {t("hero.resume.note")}
      </m.p>
    </div>
  )
}
