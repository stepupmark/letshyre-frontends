import { useTranslation } from "@workspace/i18n/react"
import { ChartNoAxesColumn, LockOpen, Search } from "lucide-react"
import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

import { SearchArt } from "./search-art"

const STEPS = [
  { key: "search", icon: Search },
  { key: "compare", icon: ChartNoAxesColumn },
  { key: "unlock", icon: LockOpen },
] as const

export function IdleGuide() {
  const { t, i18n } = useTranslation("candidateSearch")
  const number = new Intl.NumberFormat(i18n.language, {
    minimumIntegerDigits: 2,
  })

  return (
    <section
      aria-labelledby="idle-guide"
      className="flex flex-col items-center gap-8 py-4 sm:py-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <SearchArt />
        <div className="flex max-w-md flex-col gap-1.5">
          <h2
            id="idle-guide"
            className="text-lg font-semibold tracking-tight text-balance text-brand-text"
          >
            {t("idle.title")}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("idle.body")}
          </p>
        </div>
      </div>

      <ol
        aria-label={t("steps.label")}
        className="grid w-full max-w-4xl gap-3 sm:grid-cols-3"
      >
        {STEPS.map(({ key, icon: Icon }, i) => (
          <m.li
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.base,
              ease,
              delay: 0.1 + i * 0.06,
            }}
            className="flex gap-3 rounded-xl border bg-card p-4 sm:flex-col"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand-text">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span
                aria-hidden="true"
                className="text-xs font-medium text-muted-foreground tabular-nums max-sm:hidden"
              >
                {number.format(i + 1)}
              </span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-sm font-semibold">
                {t(`steps.${key}.title`)}
              </span>
              <span className="text-sm text-pretty text-muted-foreground">
                {t(`steps.${key}.body`)}
              </span>
            </span>
          </m.li>
        ))}
      </ol>
    </section>
  )
}
