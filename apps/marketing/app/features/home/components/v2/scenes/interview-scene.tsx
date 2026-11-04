import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { MicIcon } from "lucide-react"
import type { CSSProperties } from "react"

import { wait } from "@/components/art/delay"

import { Photo } from "../photo"
import { Panel } from "../stage"

const LEVELS = [40, 70, 100, 60, 85, 45, 75, 55]
const ATTEMPTS = 3
const USED = 1

export function InterviewScene() {
  const { t } = useTranslation("homeV2")

  return (
    <div className="relative">
      <Photo
        name="video-interview"
        alt={t("professionals.photo")}
        sizes="(min-width: 1152px) 500px, (min-width: 1024px) 42vw, calc(100vw - 5rem)"
      />

      <div
        role="img"
        aria-label={t("professionals.scene.label")}
        className="relative -mt-16 px-4 sm:absolute sm:inset-0 sm:mt-0 sm:px-0"
      >
        <Panel
          aria-hidden
          className="drop-in overflow-hidden sm:absolute sm:-inset-s-4 sm:top-6 sm:w-80 lg:-inset-s-8"
        >
          <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5 text-xs">
            <span className="font-medium">{t("professionals.scene.app")}</span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground tabular-nums">
              <span className="size-1.5 rounded-full bg-destructive" />
              {t("professionals.scene.time")}
            </span>
          </div>
          <div className="p-4">
            <p className="text-xs font-medium text-brand-text">
              {t("professionals.scene.question")}
            </p>
            <p className="mt-2 text-sm font-medium text-balance">
              {t("professionals.scene.prompt")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-muted text-brand-text">
                <MicIcon className="size-4" />
              </span>
              <span className="flex h-5 items-end gap-1">
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

        <Panel
          aria-hidden
          className="drop-in mt-3 p-4 sm:absolute sm:inset-e-4 sm:-bottom-8 sm:mt-0 sm:w-56"
          style={{ "--i": 1 } as CSSProperties}
        >
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
      </div>
    </div>
  )
}
