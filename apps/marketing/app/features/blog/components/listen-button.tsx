import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { PauseIcon, PlayIcon, Volume2Icon } from "lucide-react"
import { useRef } from "react"

import { useListen } from "../hooks/use-listen"
import { ListenPlayer } from "./listen-player"

export default function ListenButton({
  lang,
  title,
}: {
  lang: string
  title: string
}) {
  const { t } = useTranslation("blog")
  const listen = useListen(lang, title)
  const trigger = useRef<HTMLButtonElement>(null)
  if (!listen.available) return null

  const { status } = listen

  return (
    <>
      <Button
        ref={trigger}
        variant="outline"
        onClick={
          status === "playing"
            ? listen.pause
            : status === "paused"
              ? listen.resume
              : listen.play
        }
      >
        {status === "playing" ? (
          <PauseIcon aria-hidden />
        ) : status === "paused" ? (
          <PlayIcon aria-hidden />
        ) : (
          <Volume2Icon aria-hidden />
        )}
        {t(
          status === "playing"
            ? "post.pause"
            : status === "paused"
              ? "post.keepListening"
              : "post.listen"
        )}
      </Button>
      {status !== "idle" && (
        <ListenPlayer
          listen={listen}
          title={title}
          onStop={() => {
            listen.stop()
            trigger.current?.focus()
          }}
        />
      )}
    </>
  )
}
