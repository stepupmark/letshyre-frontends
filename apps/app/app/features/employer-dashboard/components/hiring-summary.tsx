import { useLocale, useTranslation } from "@workspace/i18n/react"
import { CircleCheck } from "lucide-react"
import { useId } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"

export function HiringSummary({
  openJobs,
  closedJobs,
  applications,
  caughtUp,
}: {
  openJobs: number
  closedJobs: number
  applications: number
  caughtUp: boolean
}) {
  const { t } = useTranslation("dashboard")
  const locale = useLocale()
  const id = useId()
  const jobs = href("/employer/jobs")
  const figures = [
    { key: "open", value: openJobs, to: `${jobs}?status=open` },
    { key: "closed", value: closedJobs, to: `${jobs}?status=closed` },
    { key: "applications", value: applications, to: jobs },
  ] as const

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={id} className="text-base font-semibold tracking-tight">
          {t("stats.heading")}
        </h2>
        {caughtUp && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CircleCheck
              aria-hidden="true"
              className="size-4 shrink-0 text-success"
            />
            {t("attention.clear.title")}
          </p>
        )}
      </div>
      <ul className="grid grid-cols-3 divide-x overflow-hidden rounded-lg border bg-card rtl:divide-x-reverse">
        {figures.map((figure) => (
          <li key={figure.key}>
            <AppLink
              to={figure.to}
              className="group flex h-full flex-col gap-1 p-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:inset-ring-2 focus-visible:inset-ring-ring/50 sm:p-5"
            >
              <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                <AnimatedNumber value={figure.value} locale={locale} from={0} />
              </span>
              <span className="text-xs text-pretty text-muted-foreground group-hover:text-foreground sm:text-sm">
                {t(`stats.${figure.key}`)}
              </span>
            </AppLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
