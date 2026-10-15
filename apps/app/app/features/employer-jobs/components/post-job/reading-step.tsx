import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { Banknote, Check, MapPin, UserRoundSearch, Wrench } from "lucide-react"
import { useEffect, useId, useRef } from "react"

import type { ReadStage } from "../../mutations/use-parse-jd"
import { ReadingArt } from "../art/jd-art"

const STAGES = ["uploading", "reading"] as const satisfies ReadStage[]

const LOOKING_FOR = [
  { key: "role", icon: UserRoundSearch },
  { key: "skills", icon: Wrench },
  { key: "pay", icon: Banknote },
  { key: "place", icon: MapPin },
] as const

export function ReadingStep({
  stage,
  progress,
  onCancel,
}: {
  stage: ReadStage
  progress: number
  onCancel: () => void
}) {
  const { t } = useTranslation("jobs")
  const locale = useLocale()
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const current = STAGES.indexOf(stage)

  // the button that started this is gone, so focus would fall to the page
  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <section
      aria-labelledby={id}
      className="settle grid max-w-3xl gap-6 rounded-2xl border bg-card p-5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8 sm:p-8"
    >
      <div className="grid place-items-center rounded-xl bg-muted/50 px-4 py-6">
        <ReadingArt />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2
            id={id}
            ref={heading}
            tabIndex={-1}
            className="text-lg font-semibold text-balance text-brand-text outline-none"
          >
            {t("post.reading")}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("post.readingHint")}
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          {STAGES.map((key, i) => {
            const done = i < current
            const active = i === current
            return (
              <li
                key={key}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 text-sm",
                  !done && !active && "text-muted-foreground"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full",
                    done && "bg-success text-background",
                    active && "text-brand-text",
                    !done && !active && "border"
                  )}
                >
                  {done && <Check className="pop size-3.5" strokeWidth={3} />}
                  {active && <Spinner className="size-4" />}
                </span>
                <span className={cn(active && "font-medium")}>
                  {t(`post.stages.${key}`)}
                </span>
                {key === "uploading" && active && (
                  <span className="text-muted-foreground tabular-nums">
                    {new Intl.NumberFormat(locale, {
                      style: "percent",
                    }).format(progress)}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
        <p role="status" className="sr-only">
          {t(`post.stages.${stage}`)}
        </p>

        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("post.lookingFor")}
          </p>
          <ul className="flex flex-wrap gap-2">
            {LOOKING_FOR.map(({ key, icon: Icon }, i) => (
              <li
                key={key}
                style={{ transitionDelay: `${200 + i * 90}ms` }}
                className="settle flex items-center gap-1.5 rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand-text"
              >
                <Icon aria-hidden="true" className="size-3.5" />
                {t(`post.found.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Button variant="outline" onClick={onCancel}>
            {t("post.cancel")}
          </Button>
        </div>
      </div>
    </section>
  )
}
