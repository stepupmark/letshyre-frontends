import { useTranslation } from "@workspace/i18n/react"
import { UserRoundIcon } from "lucide-react"
import type { ReactNode } from "react"

const METRICS = [
  "experience",
  "interview",
  "match",
  "roleFit",
  "skills",
  "interviews",
] as const

function Marker({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums"
    >
      {children}
    </span>
  )
}

/** A sample pool card with each number tied to what it means. */
export function ScoreExplainer() {
  const { t } = useTranslation("employerGuide")

  return (
    <div className="mt-10 flex flex-col gap-6">
      <div className="flex max-w-2xl flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-balance text-brand-text">
          {t("score.title")}
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("score.lead")}
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div aria-hidden className="reveal rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand-muted text-brand-text">
              <UserRoundIcon className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{t("score.sample.name")}</span>
              <span className="text-sm text-muted-foreground">
                {t("score.sample.role")}
              </span>
            </div>
            <span className="rounded-md bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text">
              {t("score.sample.band")}
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {METRICS.map((metric, i) => (
              <div
                key={metric}
                className="flex flex-col gap-1 rounded-xl bg-muted/50 p-2.5"
              >
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Marker>{i + 1}</Marker>
                  {t(`score.items.${metric}.term`)}
                </dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {t(`score.sample.${metric}`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="flex flex-col divide-y">
          {METRICS.map((metric, i) => (
            <li key={metric} className="flex gap-3 py-3 first:pt-0">
              <Marker>{i + 1}</Marker>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <p className="font-semibold tracking-tight sm:w-32 sm:shrink-0">
                  {t(`score.items.${metric}.term`)}
                </p>
                <p className="text-sm text-pretty text-muted-foreground">
                  {t(`score.items.${metric}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="max-w-2xl text-sm text-pretty">{t("score.note")}</p>
    </div>
  )
}
