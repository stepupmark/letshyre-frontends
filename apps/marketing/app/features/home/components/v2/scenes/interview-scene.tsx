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
        sizes="(min-width: 1152px) 460px, (min-width: 1024px) 40vw, calc(100vw - 2rem)"
        portrait
      />

      <div
        role="img"
        aria-label={t("professionals.scene.label")}
        className="absolute inset-0"
      >
        <span
          aria-hidden
          className="drop-in absolute inset-s-3 top-3 inline-flex items-center gap-2.5 rounded-full border bg-card px-3 py-1.5 text-xs sm:inset-s-4 sm:top-4"
        >
          <span className="text-muted-foreground">
            {t("professionals.scene.attempts")}
          </span>
          <span className="flex w-10 gap-1">
            {Array.from({ length: ATTEMPTS }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  index < USED ? "bg-brand" : "bg-muted"
                )}
              />
            ))}
          </span>
          <span className="font-medium">{t("professionals.scene.used")}</span>
        </span>

        <Panel
          aria-hidden
          className="drop-in absolute inset-x-3 bottom-3 p-4 sm:inset-x-4 sm:bottom-4"
          style={{ "--i": 1 } as CSSProperties}
        >
          <p className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-brand-text">
              {t("professionals.scene.question")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground tabular-nums">
              <span className="size-1.5 rounded-full bg-destructive" />
              {t("professionals.scene.time")}
            </span>
          </p>
          <p className="mt-2 text-sm font-medium text-pretty">
            {t("professionals.scene.prompt")}
          </p>
          <div className="mt-3 flex items-center gap-2.5 border-t pt-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-muted text-brand-text">
              <MicIcon className="size-3.5" />
            </span>
            <span className="flex h-4 items-end gap-0.5">
              {LEVELS.map((level, index) => (
                <span
                  key={index}
                  className="level w-0.5 rounded-full bg-brand"
                  style={{ height: `${String(level)}%`, ...wait(index * 90) }}
                />
              ))}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("professionals.scene.listening")}
            </span>
          </div>
        </Panel>
      </div>
    </div>
  )
}
