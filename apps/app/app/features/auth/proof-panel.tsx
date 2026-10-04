import { useTranslation } from "@workspace/i18n/react"
import { Check } from "lucide-react"

import { StatusBadge } from "@/components/status-badge"

export type Proof = "general" | "employer" | "candidate"

const POINTS = ["one", "two", "three"] as const

const SAMPLE = [
  { key: "clarity", value: 84 },
  { key: "depth", value: 71 },
  { key: "fit", value: 78 },
] as const

/** The right half of the auth screens: what LetsHyre does, shown rather than claimed. */
export function ProofPanel({ proof }: { proof: Proof }) {
  const { t } = useTranslation("auth")

  return (
    <div className="flex h-full flex-col justify-center gap-10 p-10 xl:p-16">
      <div className="flex max-w-md flex-col gap-5">
        <p className="text-2xl font-semibold tracking-tight text-balance">
          {t(`proof.${proof}.title`)}
        </p>
        <ul className="flex flex-col gap-3 text-sm">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {t(`proof.${proof}.${point}`)}
            </li>
          ))}
        </ul>
      </div>

      <figure
        aria-hidden="true"
        className="flex max-w-sm flex-col gap-4 rounded-xl border bg-background p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {t("proof.sample.name")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("proof.sample.role")}
            </span>
          </div>
          <StatusBadge tone="success">{t("proof.sample.band")}</StatusBadge>
        </div>
        <ul className="flex flex-col gap-2.5">
          {SAMPLE.map(({ key, value }) => (
            <li
              key={key}
              className="grid grid-cols-[5rem_minmax(0,1fr)_2rem] items-center gap-3 text-xs"
            >
              <span className="text-muted-foreground">
                {t(`proof.sample.${key}`)}
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${value}%` }}
                />
              </span>
              <span className="text-end tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
        <figcaption className="text-xs text-muted-foreground">
          {t("proof.sample.caption")}
        </figcaption>
      </figure>
    </div>
  )
}
