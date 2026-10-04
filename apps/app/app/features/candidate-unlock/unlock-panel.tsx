import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CircleCheck, LockOpen } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useState } from "react"
import { useLocation } from "react-router"
import { toast } from "sonner"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { LoadError } from "@/components/query-state"
import { ScoreBand } from "@/components/score-band"
import { StatusBadge } from "@/components/status-badge"
import { creditsQuery } from "@/lib/credits"
import { duration, ease } from "@/lib/motion"
import { buttonLink } from "@/lib/button-link"

import { interviewsQuery, unlockCandidate, UNLOCKED_KEY } from "./api"
import { costOf, toggle, unlockChoices } from "./choices"

const BLURRED = { opacity: 0, filter: "blur(4px)" }
const SHARP = { opacity: 1, filter: "blur(0px)" }

/** Spends credits: cost on the button, balance after in the confirm, result in place. */
export function UnlockPanel({
  candidateId,
  name,
  matchedRole,
}: {
  candidateId: string
  name: string
  matchedRole?: string | null
}) {
  const { t } = useTranslation("unlock")
  const locale = useLocale()
  const location = useLocation()
  const queryClient = useQueryClient()
  const interviews = useQuery(interviewsQuery(candidateId))
  const credits = useQuery(creditsQuery())
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [confirming, setConfirming] = useState(false)

  const choices = unlockChoices(interviews.data ?? [], matchedRole)
  const cost = costOf(selected, choices)
  const balance = credits.data?.available_credits
  const short = balance !== undefined && cost > balance
  const back = `${location.pathname}${location.search}`

  const unlock = useMutation({
    mutationFn: () =>
      unlockCandidate(
        candidateId,
        choices.filter((c) => selected.has(String(c.id))).map((c) => c.id)
      ),
    onSuccess: async () => {
      const left = (balance ?? cost) - cost
      setConfirming(false)
      setSelected(new Set())
      toast.success(t("done", { name }), {
        description: t("doneBody", { count: cost, left }),
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: creditsQuery().queryKey }),
        queryClient.invalidateQueries({
          queryKey: interviewsQuery(candidateId).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: UNLOCKED_KEY }),
      ])
    },
    onError: () => {
      setConfirming(false)
      void queryClient.invalidateQueries({ queryKey: creditsQuery().queryKey })
    },
  })

  const allUnlocked = choices.length > 0 && choices.every((c) => c.unlocked)

  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-medium">{t("panel.title")}</h3>
        {balance !== undefined && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {t("panel.balance")}{" "}
            <AnimatedNumber value={balance} locale={locale} />
          </span>
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
                to="/employer/unlocked-candidates"
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
              <ul className="flex flex-col divide-y rounded-md border">
                {choices.map((choice) => {
                  const key = String(choice.id)
                  return (
                    <li key={key}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 has-disabled:cursor-default">
                        <Checkbox
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
                            <span className="block text-xs text-muted-foreground">
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
                            <ScoreBand score={choice.score} of="interview" />
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
                    to={`/employer/billing?next=${encodeURIComponent(back)}`}
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
                    onClick={() => {
                      setConfirming(true)
                    }}
                  >
                    <LockOpen />
                    {t("panel.button", { count: cost })}
                  </Button>
                  {cost === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("panel.pick")}
                    </p>
                  )}
                </div>
              )}
              {unlock.isError && (
                <p role="alert" className="text-destructive">
                  {t("panel.failed")}
                </p>
              )}
            </m.div>
          )}
        </AnimatePresence>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("confirm.title", { name })}
        description={t("confirm.body", {
          count: cost,
          left: (balance ?? 0) - cost,
        })}
        confirmLabel={t("panel.button", { count: cost })}
        pending={unlock.isPending}
        onConfirm={() => {
          unlock.mutate()
        }}
      />
    </section>
  )
}
