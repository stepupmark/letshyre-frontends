import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, Check, MousePointer2, Sparkles } from "lucide-react"

import { Enter, Frame, Line } from "./scene-kit"

export function DownloadScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame>
      <div className="flex w-full max-w-60 flex-col items-center">
        <div className="flex w-full flex-col gap-3 rounded-t-xl border border-b-0 bg-card p-4">
          <div className="flex items-center gap-3">
            <Enter
              play={play}
              from="down"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand-text"
            >
              <ArrowDown className="size-4" strokeWidth={2.5} />
            </Enter>
            <div className="flex flex-1 flex-col gap-1.5">
              <Line className="w-2/3" />
              <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    "block h-full rounded-full bg-brand",
                    play && "grow-x"
                  )}
                />
              </span>
            </div>
          </div>
          <Enter
            play={play}
            delay={1200}
            from="pop"
            className="flex items-center gap-2 self-center rounded-xl border bg-card px-3 py-2 shadow-xs"
          >
            <span className="text-on-media grid size-7 place-items-center rounded-lg bg-brand">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-xs font-semibold">{t("scene.app")}</span>
            <Check className="size-3.5 text-success" strokeWidth={3} />
          </Enter>
        </div>
        <span className="block h-2.5 w-[calc(100%+2rem)] rounded-b-lg border bg-muted" />
      </div>
    </Frame>
  )
}

export function SignInScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame>
      <div className="flex w-full max-w-56 flex-col gap-2.5 rounded-xl border bg-card p-4 shadow-xs">
        <Line className="mb-1 w-1/2 bg-foreground/20" />
        <Field play={play} delay={150} dots={9} />
        <Field play={play} delay={650} dots={7} />
        <Enter
          play={play}
          delay={1200}
          from="up"
          className="text-on-media mt-1 flex items-center justify-center gap-1.5 rounded-md bg-brand py-1.5 text-xs font-semibold"
        >
          {t("scene.signIn")}
          <Check className="size-3.5" strokeWidth={3} />
        </Enter>
      </div>
    </Frame>
  )
}

function Field({
  play,
  delay,
  dots,
}: {
  play: boolean
  delay: number
  dots: number
}) {
  return (
    <div className="flex h-7 items-center gap-1 rounded-md border px-2">
      {Array.from({ length: dots }, (_, i) => (
        <Enter
          key={i}
          play={play}
          delay={delay + i * 45}
          from="pop"
          className="size-1.5 rounded-full bg-foreground/50"
        />
      ))}
    </div>
  )
}

export function DashboardScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame className="place-items-stretch">
      <div className="grid grid-cols-[3rem_1fr] gap-3">
        <div className="flex flex-col gap-2 rounded-lg bg-card p-2">
          <Line />
          <Line className="w-2/3" />
          <Line className="w-3/4" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded-lg border bg-card" />
            <div className="h-10 rounded-lg border bg-card" />
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border bg-card p-3">
            <Line className="w-1/2" />
            <span className="text-on-media relative rounded-md bg-brand px-3 py-1.5 text-xs font-semibold">
              {t("scene.takeInterview")}
              <Enter
                play={play}
                delay={100}
                className="absolute -inset-e-3 -bottom-4 motion-safe:duration-700 motion-safe:slide-in-from-bottom-8"
              >
                <MousePointer2 className="size-5 fill-foreground stroke-card" />
              </Enter>
              <Enter
                play={play}
                delay={900}
                from="pop"
                className="absolute -inset-1 rounded-lg ring-2 ring-brand/40"
              />
            </span>
          </div>
        </div>
      </div>
    </Frame>
  )
}
