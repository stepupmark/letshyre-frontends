import { useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"

interface Row {
  claim: string
  proof: string
}

export function Problem() {
  const { t } = useTranslation("employers")
  const rows = t("problem.rows", { returnObjects: true }) as Row[]

  return (
    <Band
      id="problem"
      muted
      className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-20"
    >
      <BandHeading
        id="problem-title"
        className="slide-in"
        eyebrow={t("problem.eyebrow")}
        title={t("problem.title")}
        accent={t("problem.accent")}
        description={t("problem.description")}
      />

      <figure className="reveal rounded-3xl border bg-card p-5 sm:p-7">
        <div
          aria-hidden
          className="grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1.2fr)] gap-x-3 border-b pb-3 text-xs font-medium text-muted-foreground"
        >
          <span>{t("problem.claimed")}</span>
          <span />
          <span className="text-brand-text">{t("problem.shown")}</span>
        </div>
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li
              key={row.claim}
              className="grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1.2fr)] items-center gap-x-3 border-b border-dashed py-4 last:border-b-0"
            >
              <span className="relative w-fit text-pretty text-muted-foreground">
                {row.claim}
                <span
                  aria-hidden
                  className="grow-in absolute inset-x-0 top-1/2 h-px bg-foreground/50"
                />
              </span>
              <ArrowRightIcon
                aria-hidden
                className="size-4 text-muted-foreground/60 rtl:-scale-x-100"
              />
              <span className="pop-in flex items-center gap-2 rounded-lg border border-brand/25 bg-brand-muted px-3 py-2 text-sm font-medium text-pretty text-brand-text">
                <CheckIcon aria-hidden className="size-4 shrink-0" />
                {row.proof}
              </span>
            </li>
          ))}
        </ul>
        <figcaption className="mt-4 text-xs text-muted-foreground">
          {t("problem.caption")}
        </figcaption>
      </figure>
    </Band>
  )
}
