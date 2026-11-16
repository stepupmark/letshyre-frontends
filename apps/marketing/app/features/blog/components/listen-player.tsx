import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SquareIcon,
} from "lucide-react"

import type { Listen } from "../hooks/use-listen"
import { ListenVoices } from "./listen-voices"

export function ListenPlayer({
  listen,
  title,
  onStop,
}: {
  listen: Listen
  title: string
  onStop: () => void
}) {
  const { t } = useTranslation("blog")
  const { blocks, index, status, rate } = listen
  const section =
    blocks.slice(0, index + 1).findLast((block) => block.el?.tagName === "H2")
      ?.text ?? title
  const playing = status === "playing"

  return (
    <section
      aria-label={t("post.player")}
      className="fixed inset-s-4 inset-e-18 bottom-4 z-40 flex flex-col gap-2 rounded-xl border bg-background p-3 transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none sm:inset-s-0 sm:inset-e-0 sm:bottom-6 sm:mx-auto sm:w-md starting:translate-y-2 starting:opacity-0 print:hidden"
    >
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <p className="min-w-0 truncate font-medium">{section}</p>
        <p className="shrink-0 text-muted-foreground tabular-nums">
          {t("post.progress", { current: index + 1, total: blocks.length })}
        </p>
      </div>
      <Progress
        value={((index + 1) / Math.max(blocks.length, 1)) * 100}
        aria-label={t("post.player")}
      />
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="tabular-nums"
            aria-label={t("post.speed", { rate })}
            onClick={listen.cycleRate}
          >
            {t("post.rate", { rate })}
          </Button>
          <ListenVoices listen={listen} />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("post.previous")}
            disabled={index === 0}
            onClick={listen.previous}
          >
            <SkipBackIcon aria-hidden className="rtl:-scale-x-100" />
          </Button>
          <Button
            size="icon-lg"
            aria-label={t(playing ? "post.pause" : "post.keepListening")}
            onClick={playing ? listen.pause : listen.resume}
          >
            {playing ? <PauseIcon aria-hidden /> : <PlayIcon aria-hidden />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("post.next")}
            disabled={index >= blocks.length - 1}
            onClick={listen.next}
          >
            <SkipForwardIcon aria-hidden className="rtl:-scale-x-100" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("post.stopListening")}
          onClick={onStop}
        >
          <SquareIcon aria-hidden />
        </Button>
      </div>
    </section>
  )
}
