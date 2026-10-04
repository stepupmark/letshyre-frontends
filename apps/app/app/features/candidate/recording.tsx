import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { RotateCw } from "lucide-react"
import { useRef, useState } from "react"

// signed URLs change on every load, the path doesn't
const keyOf = (src: string) => {
  try {
    return `recording:${new URL(src).pathname}`
  } catch {
    return `recording:${src}`
  }
}

const savedAt = (key: string) => {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

/** The interview recording, picking up where the viewer left off. */
export function Recording({ src }: { src: string }) {
  const { t } = useTranslation("scorecard")
  const saved = useRef(0)
  const [failed, setFailed] = useState(false)
  const key = keyOf(src)

  if (failed)
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border p-4 text-sm">
        <p className="text-muted-foreground">{t("recording.failed")}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFailed(false)
          }}
        >
          <RotateCw />
          {t("recording.retry")}
        </Button>
      </div>
    )

  return (
    // recordings come without a caption track
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      controls
      controlsList="nodownload"
      playsInline
      preload="none"
      src={src}
      aria-label={t("recording.heading")}
      className="aspect-video w-full rounded-lg bg-muted print:hidden"
      onLoadedMetadata={(event) => {
        const el = event.currentTarget
        const at = savedAt(key)
        if (at > 5 && at < el.duration - 5) el.currentTime = at
      }}
      onTimeUpdate={(event) => {
        const at = event.currentTarget.currentTime
        if (Math.abs(at - saved.current) < 5) return
        saved.current = at
        try {
          localStorage.setItem(key, String(Math.floor(at)))
        } catch {
          /* resuming is a nicety */
        }
      }}
      onEnded={() => {
        try {
          localStorage.removeItem(key)
        } catch {
          /* nothing to clear */
        }
      }}
      onError={() => {
        setFailed(true)
      }}
    >
      {t("recording.unsupported")}
    </video>
  )
}
