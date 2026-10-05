import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Progress } from "@workspace/ui/components/progress"
import { cn } from "@workspace/ui/lib/utils"
import { Download, ExternalLink, Lightbulb } from "lucide-react"
import { useId, useState } from "react"

import { buttonLink } from "@/lib/button-link"
import { sitePage } from "@/lib/site"

const PHASES = [
  { id: "setup", steps: ["download", "signIn", "dashboard"] },
  { id: "security", steps: ["clearEnv", "permissions", "verifyId"] },
  { id: "interview", steps: ["chooseRole", "begin"] },
] as const
type StepKey = (typeof PHASES)[number]["steps"][number]
const ALL: readonly string[] = PHASES.flatMap((phase) => phase.steps)

// ticks are a per-device convenience, so they live in the browser only
const STORE = "guide:v1"
const load = (): string[] => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORE) ?? "[]")
    return Array.isArray(raw)
      ? raw.filter(
          (key): key is string => typeof key === "string" && ALL.includes(key)
        )
      : []
  } catch {
    return []
  }
}
const store = (done: string[]) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(done))
  } catch {
    /* empty */
  }
}

export function InterviewGuide() {
  const { t } = useTranslation("guide")
  const locale = useLocale()
  const [done, setDone] = useState(load)
  const download = sitePage(locale, "/download")

  const set = (key: string, checked: boolean) => {
    const next = checked
      ? [...new Set([...done, key])]
      : done.filter((item) => item !== key)
    setDone(next)
    store(next)
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Progress
            value={(done.length / ALL.length) * 100}
            aria-label={t("progressLabel")}
            className="flex-1"
          />
          <span
            aria-live="polite"
            className="text-sm text-muted-foreground tabular-nums"
          >
            {t("progress", { done: done.length, total: ALL.length })}
          </span>
        </div>

        {PHASES.map((phase) => (
          <section key={phase.id} className="flex flex-col gap-3">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t(`phases.${phase.id}`)}
            </h2>
            <ol className="flex flex-col divide-y rounded-lg border">
              {phase.steps.map((key) => (
                <Step
                  key={key}
                  stepKey={key}
                  number={ALL.indexOf(key) + 1}
                  checked={done.includes(key)}
                  onChange={(checked) => {
                    set(key, checked)
                  }}
                  download={key === "download" ? download : undefined}
                />
              ))}
            </ol>
          </section>
        ))}

        {done.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => {
              setDone([])
              store([])
            }}
          >
            {t("reset")}
          </Button>
        )}
      </div>

      <aside className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-5 lg:sticky lg:top-20">
        <h2 className="font-medium">{t("cta.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("cta.body")}</p>
        <a href={download} className={buttonLink({ className: "w-full" })}>
          <Download />
          {t("cta.button")}
        </a>
      </aside>
    </div>
  )
}

function Step({
  stepKey,
  number,
  checked,
  onChange,
  download,
}: {
  stepKey: StepKey
  number: number
  checked: boolean
  onChange: (checked: boolean) => void
  download?: string
}) {
  const { t } = useTranslation("guide")
  const id = useId()
  return (
    <li className="flex gap-3 p-4">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => {
          onChange(value)
        }}
        aria-describedby={`${id}-desc`}
        className="mt-0.5"
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <label
          htmlFor={id}
          className={cn(
            "cursor-pointer font-medium transition-colors",
            checked && "text-muted-foreground line-through decoration-1"
          )}
        >
          <span className="text-muted-foreground tabular-nums">{number}. </span>
          {t(`steps.${stepKey}.title`)}
        </label>
        <p
          id={`${id}-desc`}
          className="text-sm text-pretty text-muted-foreground"
        >
          {t(`steps.${stepKey}.body`)}
        </p>
        {download && (
          <a
            href={download}
            className="inline-flex items-center gap-1 self-start text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("steps.download.link")}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        )}
        {(stepKey === "clearEnv" || stepKey === "verifyId") && (
          <p className="flex items-start gap-1.5 text-sm">
            <Lightbulb
              className="mt-0.5 size-4 shrink-0 text-warning"
              aria-hidden="true"
            />
            {t(`steps.${stepKey}.tip`)}
          </p>
        )}
      </div>
    </li>
  )
}
