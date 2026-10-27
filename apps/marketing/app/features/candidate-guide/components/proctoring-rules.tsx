import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import {
  ShieldAlertIcon,
  CircleSlashIcon,
  ScanFaceIcon,
  TimerIcon,
  BellRingIcon,
  WifiOffIcon,
} from "lucide-react"

import { RULES_ANCHOR } from "../lib/chapters"

const LIMITS = [
  { id: "strikes", icon: CircleSlashIcon },
  { id: "repeat", icon: TimerIcon },
  { id: "face", icon: ScanFaceIcon },
  { id: "internet", icon: WifiOffIcon },
] as const

function StrikeMeter() {
  const { t } = useTranslation("candidateGuide")

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{t("rules.meter")}</p>
      <ol className="grid grid-cols-3 gap-2 sm:gap-3">
        {[1, 2, 3].map((number) => (
          <li key={number} className="flex flex-col gap-2">
            <span className="h-2 overflow-hidden rounded-full bg-muted">
              <span
                className={cn(
                  "grow-in block h-full origin-left rtl:origin-right",
                  number === 3 ? "bg-danger" : "bg-warning"
                )}
                style={{
                  animationRange: `entry ${30 + number * 12}% cover ${40 + number * 8}%`,
                }}
              />
            </span>
            <span className="flex flex-col text-sm">
              <span className="font-medium tabular-nums">
                {t("rules.strike", { number })}
              </span>
              {number === 3 && (
                <span className="font-medium text-danger">
                  {t("rules.ends")}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The proctoring rules from the desktop app's "Before you begin" screen. */
export function ProctoringRules() {
  const { t } = useTranslation("candidateGuide")
  const strikes = t("rules.strikeItems", { returnObjects: true })
  const warnings = t("rules.warningItems", { returnObjects: true })

  return (
    <div id={RULES_ANCHOR} className="mt-10 flex flex-col gap-6">
      <div className="flex max-w-2xl flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-balance text-brand-text">
          {t("rules.title")}
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("rules.lead")}
        </p>
      </div>

      <StrikeMeter />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="reveal flex flex-col gap-3 rounded-2xl border p-5">
          <h4 className="flex items-center gap-2.5 font-semibold tracking-tight text-danger">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-danger-muted"
            >
              <ShieldAlertIcon className="size-4" />
            </span>
            {t("rules.strikes")}
          </h4>
          <ul className="flex flex-col gap-2 text-sm">
            {strikes.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal flex flex-col gap-3 rounded-2xl border p-5">
          <h4 className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-warning-muted text-warning"
            >
              <BellRingIcon className="size-4" />
            </span>
            {t("rules.warnings")}
          </h4>
          <ul className="flex flex-col gap-2 text-sm">
            {warnings.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border bg-muted/40 p-5 sm:p-6">
        <h4 className="font-semibold tracking-tight">{t("rules.limits")}</h4>
        <ul className="grid gap-4 sm:grid-cols-2">
          {LIMITS.map(({ id, icon: Icon }) => (
            <li key={id} className="flex items-start gap-3 text-sm">
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-background text-brand-text"
              >
                <Icon className="size-4" />
              </span>
              <span className="pt-1.5 text-pretty">
                {t(`rules.limitItems.${id}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
