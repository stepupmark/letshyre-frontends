import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { BriefcaseIcon, SparklesIcon } from "lucide-react"

import { FileHead } from "@/components/art/file-head"
import { Meter } from "@/components/art/meter"
import { ScoreRing } from "@/components/art/score-ring"

const ATTEMPTS = 3

/** The professional's own scorecard, arriving with a new job match. */
export function HeroCard() {
  const { t } = useTranslation("candidates")

  return (
    <figure aria-hidden className="relative mx-auto w-full max-w-md lg:me-0">
      <div className="relative">
        <div className="rise rounded-3xl border bg-card p-5 sm:p-6">
          <FileHead name={t("hero.card.name")} role={t("hero.card.role")} />

          <div className="mt-6 flex items-center gap-5 rounded-2xl border bg-muted/40 p-4">
            <ScoreRing score={82} caption={t("hero.card.outOf")} />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {t("hero.card.score")}
              </p>
              <p className="mt-2 flex items-center gap-1.5">
                {Array.from({ length: ATTEMPTS }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-6 rounded-full",
                      i === 0 ? "bg-brand" : "bg-muted-foreground/20"
                    )}
                  />
                ))}
                <span className="ms-1.5 text-xs text-muted-foreground">
                  {t("hero.card.attempt")}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Meter label={t("hero.card.clarity")} value={86} animate />
            <Meter label={t("hero.card.depth")} value={80} animate />
          </div>

          <p
            className="pop mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-muted px-3 py-1 text-xs font-medium text-brand-text"
            style={{ animationDelay: `900ms` }}
          >
            <SparklesIcon className="size-3.5" />
            {t("hero.card.strength")}: {t("hero.card.strengthValue")}
          </p>
        </div>

        <div
          className="pop absolute inset-x-6 -bottom-11 flex items-center gap-3 rounded-2xl border bg-background p-3 sm:inset-s-auto sm:-inset-e-6 sm:w-72"
          style={{ animationDelay: `1400ms` }}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BriefcaseIcon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">
              {t("hero.card.match")}
            </span>
            <span className="block truncate text-sm font-semibold">
              {t("hero.card.matchValue")}
            </span>
          </span>
        </div>
      </div>
      <figcaption className="mt-14 text-center text-xs text-muted-foreground">
        {t("hero.card.caption")}
      </figcaption>
    </figure>
  )
}
