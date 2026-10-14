import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Timer, UserRound } from "lucide-react"

import { Enter, Frame, Line } from "./scene-kit"

const ROLES = ["a", "b", "c"] as const

export function RoleScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame>
      <div className="flex w-full max-w-56 flex-col gap-2">
        {ROLES.map((role, i) => {
          const picked = i === 0
          return (
            <Enter
              key={role}
              play={play}
              delay={150 + i * 120}
              from="up"
              className={cn(
                "flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-xs",
                picked && "border-brand bg-brand-muted/60"
              )}
            >
              <span
                className={cn(
                  "grid size-3.5 place-items-center rounded-full border",
                  picked && "border-brand"
                )}
              >
                {picked && <span className="size-1.5 rounded-full bg-brand" />}
              </span>
              <span className="flex-1">{t(`scene.roles.${role}`)}</span>
              {picked && (
                <Enter
                  play={play}
                  delay={800}
                  from="pop"
                  className="text-on-media rounded-full bg-brand px-1.5 py-px text-[0.625rem] font-semibold"
                >
                  {t("scene.fromProfile")}
                </Enter>
              )}
            </Enter>
          )
        })}
      </div>
    </Frame>
  )
}

export function BeginScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame className="bg-stage p-4">
      <div className="flex size-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="bg-on-media/10 text-on-media flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive motion-reduce:animate-none" />
            {t("scene.recording")}
          </span>
          <span className="text-on-media/80 flex items-center gap-1 text-[0.625rem] font-semibold tabular-nums">
            <Timer className="size-3" />
            {t("scene.timer")}
          </span>
        </div>
        <Enter
          play={play}
          delay={250}
          from="up"
          className="flex flex-1 flex-col justify-center gap-2 rounded-lg bg-card p-4"
        >
          <span className="text-[0.625rem] font-semibold tracking-wide text-brand-text uppercase">
            {t("scene.question")}
          </span>
          <Line className="w-11/12 bg-foreground/20" />
          <Line className="w-3/4 bg-foreground/20" />
        </Enter>
        <div className="flex items-center justify-between">
          <Enter
            play={play}
            delay={600}
            from="pop"
            className="bg-on-media/10 text-on-media/70 grid size-9 place-items-center rounded-lg"
          >
            <UserRound className="size-4" />
          </Enter>
          <Enter
            play={play}
            delay={800}
            from="up"
            className="text-on-media flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 text-[0.625rem] font-semibold"
          >
            {t("scene.next")}
            <Check className="size-3" strokeWidth={3} />
          </Enter>
        </div>
      </div>
    </Frame>
  )
}
