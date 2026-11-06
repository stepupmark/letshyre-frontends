import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { CircleCheck, LockOpen } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useState } from "react"
import { href, useLocation } from "react-router"
import { toast } from "sonner"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { LoadError } from "@/components/query-state"
import { StatusBadge } from "@/components/status-badge"
import { creditsQuery } from "@/lib/credits"
import { duration, ease } from "@/lib/motion"
import { buttonLink } from "@/lib/button-link"

import { useUnlock } from "../mutations/use-unlock"
import { interviewsQuery } from "../queries/candidate-unlock.queries"
import { costOf, toggle, unlockChoices } from "../lib/choices"
import { unlockProblem, type UnlockProblem } from "../lib/unlock-error"

const FAILED = {
  noCredits: "panel.failedNoCredits",
  alreadyUnlocked: "panel.failedAlready",
  network: "panel.failedNetwork",
  other: "panel.failed",
} as const satisfies Record<UnlockProblem, string>

const BLURRED = { opacity: 0, filter: "blur(4px)" }
const SHARP = { opacity: 1, filter: "blur(0px)" }

export function UnlockPanel({
  candidateId,
  name,
  matchedRole,
  onUnlocked,
}: {
  candidateId: string
  name: string
  matchedRole?: string | null
  onUnlocked?: () => Promise<unknown>
}) {
  const { t } = useTranslation("unlock")
  const locale = useLocale()
  const location = useLocation()
  const interviews = useQuery(interviewsQuery(candidateId))
  const credits = useQuery(creditsQuery())
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())

  const choices = unlockChoices(interviews.data ?? [], matchedRole)
  const cost = costOf(selected, choices)
  const balance = credits.data?.available_credits
  const short = balance !== undefined && cost > balance
  const back = `${location.pathname}${location.search}`

  const unlock = useUnlock(candidateId, {
    onUnlocked: async (left) => {
      const used = cost
      setSelected(new Set())
      toast.success(t("done", { name }), {
        description: t("doneBody", {
          count: used,
          left: left ?? (balance ?? used) - used,
        }),
        position: "top-center",
      })
      await onUnlocked?.()
    },
  })

  const allUnlocked = choices.length > 0 && choices.every((c) => c.unlocked)

  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-medium">{t("panel.title")}</h3>
        {credits.isError ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {t("panel.balanceFailed")}
            <Button
              variant="link"
              size="xs"
              className="h-auto p-0"
              disabled={credits.isRefetching}
              onClick={() => void credits.refetch()}
            >
              {t("panel.retry")}
            </Button>
          </span>
        ) : (
          balance !== undefined && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {t("panel.balance")}{" "}
              <AnimatedNumber value={balance} locale={locale} />
            </span>
          )
        )}
      </div>

      {interviews.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      ) : interviews.isError ? (
        <LoadError
          onRetry={() => void interviews.refetch()}
          retrying={interviews.isRefetching}
        />
      ) : choices.length === 0 ? (
        <p className="text-muted-foreground">{t("panel.none")}</p>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {allUnlocked ? (
            <m.div
              key="unlocked"
              initial={BLURRED}
              animate={SHARP}
              transition={{ duration: duration.slow, ease }}
              className="flex flex-col items-start gap-3"
            >
              <p className="flex items-center gap-2">
                <CircleCheck
                  className="size-4 text-success"
                  aria-hidden="true"
                />
                {t("panel.allUnlocked")}
              </p>
              <AppLink
                to={href("/employer/candidates/unlocked")}
                className={buttonLink({ variant: "outline", size: "sm" })}
              >
                {t("panel.openUnlocked")}
              </AppLink>
            </m.div>
          ) : (
            <m.div
              key="locked"
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <p className="text-muted-foreground">{t("panel.lead")}</p>
              <ul className="flex flex-col divide-y overflow-hidden rounded-md border">
                {choices.map((choice) => {
                  const key = String(choice.id)
                  return (
                    <li key={key}>
                      <label
                        data-selected={
                          (!choice.unlocked && selected.has(key)) || undefined
                        }
                        data-done={choice.unlocked || undefined}
                        className="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/60 has-disabled:cursor-default data-done:hover:bg-transparent motion-reduce:transition-none data-selected:bg-brand-muted data-selected:hover:bg-brand-muted"
                      >
                        <Checkbox
                          className="size-5 border-muted-foreground/60 bg-background"
                          checked={choice.unlocked || selected.has(key)}
                          disabled={choice.unlocked || unlock.isPending}
                          onCheckedChange={() => {
                            setSelected((prev) => toggle(prev, choice))
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 block wrap-break-word">
                            {choice.role}
                          </span>
                          {choice.primary && (
                            <span className="block text-xs text-muted-foreground group-data-selected:text-brand-text">
                              {t("panel.matched")}
                            </span>
                          )}
                        </span>
                        {choice.unlocked ? (
                          <StatusBadge tone="success">
                            {t("panel.unlocked")}
                          </StatusBadge>
                        ) : (
                          choice.score != null && (
                            <span className="shrink-0 text-xs text-muted-foreground tabular-nums group-data-selected:text-brand-text">
                              {t("panel.score", {
                                score: Math.round(choice.score),
                              })}
                            </span>
                          )
                        )}
                      </label>
                    </li>
                  )
                })}
              </ul>

              {short ? (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-muted-foreground">
                    {t("panel.short", { cost, balance })}
                  </p>
                  <AppLink
                    to={`${href("/employer/billing")}?next=${encodeURIComponent(back)}`}
                    className={buttonLink()}
                  >
                    {t("panel.addCredits")}
                  </AppLink>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-1.5">
                  <Button
                    disabled={
                      cost === 0 || balance === undefined || unlock.isPending
                    }
                    aria-busy={unlock.isPending}
                    onClick={() => {
                      unlock.mutate(
                        choices
                          .filter((c) => selected.has(String(c.id)))
                          .map((c) => c.id)
                      )
                    }}
                  >
                    <LockOpen />
                    {cost === 0
                      ? t("panel.title")
                      : t("panel.button", { count: cost })}
                  </Button>
                  {(cost === 0 || credits.isError) && (
                    <p className="text-xs text-muted-foreground">
                      {cost === 0 ? t("panel.pick") : t("panel.needBalance")}
                    </p>
                  )}
                </div>
              )}
              {unlock.isError && (
                <p role="alert" className="text-destructive">
                  {t(FAILED[unlockProblem(unlock.error)])}
                </p>
              )}
            </m.div>
          )}
        </AnimatePresence>
      )}
    </section>
  )
}
