import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import {
  BadgeCheck,
  Camera,
  Globe,
  Mic,
  MonitorUp,
  ShieldCheck,
  Video,
  MessageCircle,
  UserRound,
} from "lucide-react"

import { Enter, Frame, Line } from "./scene-kit"

const APPS = [Globe, Video, MessageCircle]

export function ClearScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame>
      {APPS.map((Icon, i) => (
        <div
          key={i}
          style={{
            animationDelay: `${300 + i * 350}ms`,
            insetInlineStart: `${12 + i * 16}%`,
            top: `${12 + i * 13}%`,
          }}
          className={cn(
            "absolute flex w-[46%] flex-col gap-2 rounded-lg border bg-card p-2.5 shadow-sm motion-reduce:hidden",
            play
              ? "motion-safe:animate-out motion-safe:fill-mode-forwards motion-safe:zoom-out-90 motion-safe:fade-out"
              : "hidden"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Icon className="size-3.5 text-muted-foreground" />
            <Line className="w-1/2" />
          </div>
          <Line />
          <Line className="w-2/3" />
        </div>
      ))}
      <Enter
        play={play}
        delay={1300}
        from="pop"
        className="flex flex-col items-center gap-2"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-success/12 text-success">
          <ShieldCheck className="size-6" />
        </span>
        <span className="text-xs font-semibold">{t("scene.clear")}</span>
      </Enter>
    </Frame>
  )
}

const ACCESS = [
  ["camera", Camera],
  ["mic", Mic],
  ["screen", MonitorUp],
] as const

export function PermissionsScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame>
      <ul className="flex w-full max-w-56 flex-col gap-2">
        {ACCESS.map(([key, Icon], i) => (
          <li
            key={key}
            className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-xs"
          >
            <Icon className="size-4 text-brand-text" />
            <span className="flex-1 text-xs font-medium">
              {t(`scene.${key}`)}
            </span>
            <span className="relative flex h-4 w-7 items-center rounded-full bg-muted p-0.5">
              <Enter
                play={play}
                delay={300 + i * 400}
                className="absolute inset-0 rounded-full bg-brand"
              />
              <Enter
                play={play}
                delay={300 + i * 400}
                from="start"
                className="relative ms-auto size-3 rounded-full bg-card shadow-xs motion-safe:slide-in-from-start-3"
              />
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

export function VerifyScene({ play }: { play: boolean }) {
  const { t } = useTranslation("guide")
  return (
    <Frame>
      <div className="relative grid size-32 place-items-center overflow-hidden rounded-2xl bg-card shadow-xs">
        <UserRound className="size-16 text-brand/40" strokeWidth={1.25} />
        <span className="absolute inset-3 rounded-xl border-2 border-dashed border-brand/40" />
        {play && (
          <span className="scan absolute inset-x-3 h-0.5 rounded-full bg-brand shadow-[0_0_12px_var(--brand)] motion-reduce:hidden" />
        )}
      </div>
      <Enter
        play={play}
        delay={1900}
        from="up"
        className="text-on-media absolute bottom-[14%] flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-xs font-semibold shadow-sm"
      >
        <BadgeCheck className="size-3.5" />
        {t("scene.matched")}
      </Enter>
    </Frame>
  )
}
