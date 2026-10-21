import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon } from "lucide-react"

import { Line } from "@/components/art/svg"
import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"

export function Fairness() {
  const { t } = useTranslation("candidates")
  const points = t("fair.points", { returnObjects: true })
  const candidates = t("fair.candidates", { returnObjects: true })

  return (
    <Band
      id="fair"
      muted
      className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20"
    >
      <div className="slide-in">
        <BandHeading
          id="fair-title"
          eyebrow={t("fair.eyebrow")}
          title={t("fair.title")}
          accent={t("fair.accent")}
          description={t("fair.description")}
        />
        <ul className="mt-8 flex flex-col gap-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
                <CheckIcon aria-hidden className="size-3.5" />
              </span>
              <span className="text-pretty">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden className="grid grid-cols-3 items-start gap-3 sm:gap-4">
        {candidates.map((name, i) => (
          <div
            key={name}
            className={cn(
              "pop-in rounded-2xl border bg-card p-3 sm:p-4",
              i === 0 && "border-brand/40 ring-4 ring-brand/10",
              i === 1 && "mt-6",
              i === 2 && "mt-12"
            )}
          >
            <p
              className={cn(
                "truncate text-xs font-semibold",
                i === 0 ? "text-brand-text" : "text-muted-foreground"
              )}
            >
              {name}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("fair.question")}
            </p>
            <svg viewBox="0 0 80 48" className="mt-2 w-full">
              <Line x={0} y={2} width={76} strong />
              <Line x={0} y={16} width={64} />
              <Line x={0} y={28} width={70} />
              <Line x={0} y={40} width={40} />
            </svg>
          </div>
        ))}
      </div>
    </Band>
  )
}
