import { useSession } from "@workspace/auth/react"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Check, CircleDashed } from "lucide-react"
import * as m from "motion/react-m"
import { useId, useState } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import { setupSteps, type Step } from "../lib/employer-dashboard"
import { Meter } from "./meter"

// per account, so someone else signing in on this browser still sees theirs
const storageKey = (account: string) => `setup-checklist:v2:hidden:${account}`

const read = (key: string) => {
  try {
    return localStorage.getItem(key) === "1"
  } catch {
    return false
  }
}

export function SetupChecklist({ hasJobs }: { hasJobs: boolean }) {
  const { t } = useTranslation("dashboard")
  const session = useSession()
  const id = useId()
  const user = session.status === "signed-in" ? session.user : null
  const owner = user?.id ?? user?.email
  const account =
    typeof owner === "string" || typeof owner === "number" ? String(owner) : ""
  const key = storageKey(account)
  const [hidden, setHidden] = useState(() => read(key))

  const detail = (step: Step) => {
    switch (step.key) {
      case "account":
        return t("setup.account.done")
      case "job":
        return step.state === "done" ? t("setup.job.done") : t("setup.job.todo")
    }
  }
  const steps = setupSteps({ hasJobs })
  const done = steps.filter((step) => step.state === "done").length
  if (hidden || done === steps.length) return null

  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-lg border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id={id} className="text-base font-semibold tracking-tight">
            {t("setup.title")}
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {t("setup.progress", { done, total: steps.length })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setHidden(true)
            try {
              localStorage.setItem(key, "1")
            } catch {
              // storage is off; it stays hidden for this visit
            }
          }}
        >
          {t("setup.hide")}
        </Button>
      </div>
      <Meter
        value={(done / steps.length) * 100}
        label={t("setup.progress", { done, total: steps.length })}
      />
      <ol className="flex flex-col">
        {steps.map((step) => (
          <li
            key={step.key}
            className="flex flex-wrap items-start gap-x-3 gap-y-2 border-t py-3 first:border-t-0"
          >
            <StepIcon state={step.state} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
              <p
                data-done={step.state === "done"}
                className="font-medium data-[done=true]:font-normal data-[done=true]:text-muted-foreground"
              >
                {t(`setup.${step.key}.title`)}
                <span className="sr-only">{t(`setup.is.${step.state}`)}</span>
              </p>
              <p className="text-pretty text-muted-foreground">
                {detail(step)}
              </p>
            </div>
            {step.key === "job" && step.state === "todo" && (
              <AppLink
                to={href("/employer/jobs/new")}
                className={buttonLink({
                  size: "sm",
                  className: "shrink-0 max-sm:ms-7",
                })}
              >
                {t("setup.job.action")}
              </AppLink>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function StepIcon({ state }: { state: Step["state"] }) {
  if (state === "done")
    return (
      <m.span
        aria-hidden="true"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: duration.base, ease }}
        className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success text-background"
      >
        <Check className="size-3" strokeWidth={3} />
      </m.span>
    )
  return (
    <CircleDashed
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
    />
  )
}
