import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import * as m from "motion/react-m"
import { useEffect, useRef } from "react"
import { Link } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { spring } from "@/lib/motion"

import { STAGES, writeView, type Stage } from "../lib/applications"

const UNDERLINE_ID = "stage-underline"

interface Count {
  data?: number
  isPending: boolean
  isError: boolean
}

export function StageNav({ stage, counts }: { stage: Stage; counts: Count[] }) {
  const { t } = useTranslation("candidateJobs")
  const locale = useLocale()
  const active = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [stage])

  return (
    <nav aria-label={t("applications.stages")}>
      <ul className="flex scrollbar-none overflow-x-auto border-b">
        {STAGES.map((item, i) => {
          const count = counts[i]
          const current = item === stage
          return (
            <li key={item} className="shrink-0">
              <Link
                ref={current ? active : undefined}
                to={`?${writeView({ stage: item, page: 1, q: "" }, new URLSearchParams()).toString()}`}
                preventScrollReset
                aria-current={current ? "page" : undefined}
                className="relative flex h-11 items-center gap-2 px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:text-foreground"
              >
                {t(`status.${item}`)}
                {count?.isPending ? (
                  <Skeleton className="h-4 w-5 rounded-full" />
                ) : count?.isError || count?.data === undefined ? (
                  <span className="text-xs text-muted-foreground">
                    –
                    <span className="sr-only">
                      {t("applications.countFailed")}
                    </span>
                  </span>
                ) : (
                  <span className="min-w-5 rounded-full bg-muted px-1.5 text-center text-xs text-muted-foreground tabular-nums">
                    <AnimatedNumber value={count.data} locale={locale} />
                  </span>
                )}
                {current && (
                  <m.span
                    layoutId={UNDERLINE_ID}
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                    transition={spring}
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
