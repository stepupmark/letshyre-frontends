import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CalendarClockIcon, MicIcon } from "lucide-react"
import type { CSSProperties } from "react"

import { wait } from "@/components/art/delay"

import { Panel, Stage } from "../stage"

const LEVELS = [40, 70, 100, 60, 85, 45, 75, 55]
const ATTEMPTS = 3
const USED = 1

export function InterviewScene() {
  const { t } = useTranslation("homeV2")

  return (
    <Stage label={t("professionals.scene.label")}>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5 text-xs">
          <span className="font-medium">{t("professionals.scene.app")}</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground tabular-nums">
            <span className="size-1.5 rounded-full bg-destructive" />
            {t("professionals.scene.time")}
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium text-brand-text">
            {t("professionals.scene.question")}
          </p>
          <p className="mt-2 text-lg font-medium text-balance">
            {t("professionals.scene.prompt")}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-muted text-brand-text">
              <MicIcon className="size-4" />
            </span>
            <span className="flex h-6 items-end gap-1">
              {LEVELS.map((level, index) => (
                <span
                  key={index}
                  className="level w-1 rounded-full bg-brand"
                  style={{ height: `${String(level)}%`, ...wait(index * 90) }}
                />
              ))}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("professionals.scene.listening")}
            </span>
          </div>
        </div>
      </Panel>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Panel className="drop-in p-4">
          <p className="text-xs text-muted-foreground">
            {t("professionals.scene.attempts")}
          </p>
          <span className="mt-2 flex gap-1.5">
            {Array.from({ length: ATTEMPTS }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  index < USED ? "bg-brand" : "bg-muted"
                )}
              />
            ))}
          </span>
          <p className="mt-2 text-sm font-medium">
            {t("professionals.scene.used")}
          </p>
        </Panel>
        <Panel
          className="drop-in flex items-center gap-3 p-4"
          style={{ "--i": 1 } as CSSProperties}
        >
          <CalendarClockIcon className="size-5 shrink-0 text-brand-text" />
          <span>
            <span className="block text-xs text-muted-foreground">
              {t("professionals.scene.pool")}
            </span>
            <span className="text-sm font-semibold">
              {t("professionals.scene.days")}
            </span>
          </span>
        </Panel>
      </div>
    </Stage>
  )
}
