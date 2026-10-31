import type { CSSProperties } from "react"
import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"

import { wait } from "@/components/art/delay"

const LEVELS = [30, 65, 45, 90, 55, 75, 35, 85, 50, 70, 28, 60]

/** The AI interview the claims pass through: a recording with a voice level and a scan. */
export function InterviewLens({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  const { t } = useTranslation("home")

  return (
    <div
      className={cn("overflow-hidden rounded-xl border bg-card", className)}
      style={style}
    >
      <div className="flex items-center gap-1.5 border-b px-3 py-2 text-xs font-semibold">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 rounded-full bg-muted-foreground/30"
          />
        ))}
        <span className="ms-1.5 truncate">{t("hero.scene.interview")}</span>
        <span className="ms-auto inline-flex items-center gap-1.5 font-medium text-muted-foreground tabular-nums">
          <span className="size-1.5 rounded-full bg-destructive" />
          {t("hero.scene.duration")}
        </span>
      </div>

      <div className="relative flex h-26 items-end gap-3 bg-muted px-3 pt-3">
        <svg viewBox="0 0 60 70" className="w-14 shrink-0">
          <circle
            cx="30"
            cy="24"
            r="13"
            strokeWidth="1.5"
            className="fill-brand-muted stroke-brand"
          />
          <path
            d="M6 70C6 50 18 42 30 42s24 8 24 28"
            strokeWidth="1.5"
            className="fill-brand-muted stroke-brand"
          />
        </svg>
        <svg
          viewBox="0 0 120 50"
          preserveAspectRatio="none"
          className="h-12 flex-1 self-center"
        >
          {LEVELS.map((level, index) => (
            <rect
              key={index}
              x={index * 10 + 1.5}
              y={50 - level / 2}
              width="7"
              height={level / 2}
              rx="1.5"
              className="level fill-brand"
              style={wait(900 + (index % 4) * 90)}
            />
          ))}
        </svg>
        <span
          className="sweep absolute inset-x-0 top-1/2 h-0.5 bg-brand opacity-0"
          style={wait(900)}
        />
      </div>
    </div>
  )
}
