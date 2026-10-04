import { useTranslation } from "@workspace/i18n/react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { Check, CircleDashed } from "lucide-react"
import { useState } from "react"

import { AppLink } from "@/components/app-link"

const KEY = "setup-checklist:v1:hidden"

const hiddenBefore = () => {
  try {
    return localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

interface Step {
  key: "account" | "company" | "job" | "team"
  done: boolean
  to?: string
}

/** For new employers in place of a product tour; gone once everything is done. */
export function SetupChecklist({
  hasJobs,
  hasTeam,
}: {
  hasJobs: boolean
  hasTeam: boolean
}) {
  const { t } = useTranslation("dashboard")
  const [hidden, setHidden] = useState(hiddenBefore)

  const steps: Step[] = [
    { key: "account", done: true },
    { key: "company", done: true },
    { key: "job", done: hasJobs, to: "/employer/post-job" },
    { key: "team", done: hasTeam, to: "/employer/your-team" },
  ]
  const done = steps.filter((step) => step.done).length
  const next = steps.find((step) => !step.done)
  if (hidden || !next) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("setup.title")}</CardTitle>
        <CardDescription className="tabular-nums">
          {t("setup.progress", { done, total: steps.length })}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setHidden(true)
              try {
                localStorage.setItem(KEY, "1")
              } catch {
                /* hidden for this visit only */
              }
            }}
          >
            {t("setup.hide")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Progress
          value={(done / steps.length) * 100}
          aria-label={t("setup.progress", { done, total: steps.length })}
        />
        <ol className="flex flex-col">
          {steps.map((step) => (
            <li
              key={step.key}
              className="flex items-start gap-3 border-t py-3 first:border-t-0"
            >
              {step.done ? (
                <Check
                  className="mt-0.5 size-4 shrink-0 text-success"
                  aria-hidden="true"
                />
              ) : (
                <CircleDashed
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p
                  className={
                    step.done
                      ? "text-sm text-muted-foreground"
                      : "text-sm font-medium"
                  }
                >
                  {t(`setup.${step.key}.title`)}
                  <span className="sr-only">
                    {step.done ? t("setup.isDone") : t("setup.isTodo")}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(`setup.${step.key}.${step.done ? "done" : "todo"}`)}
                </p>
              </div>
              {step === next && step.to && (
                <AppLink
                  to={step.to}
                  className={buttonVariants({
                    size: "sm",
                    className: "shrink-0",
                  })}
                >
                  {t(
                    step.key === "job"
                      ? "setup.job.action"
                      : "setup.team.action"
                  )}
                </AppLink>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
