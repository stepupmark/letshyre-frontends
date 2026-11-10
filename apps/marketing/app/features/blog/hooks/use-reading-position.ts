import { useTranslation } from "@workspace/i18n/react"
import { useEffect } from "react"
import { toast } from "sonner"

import { readingPositions, rememberPosition } from "../lib/reader"

const progress = () => {
  const room = document.documentElement.scrollHeight - window.innerHeight
  return room > 0 ? Math.min(1, window.scrollY / room) : 0
}

/** Remembers how far down the post the reader got, and offers to take them back next time. */
export function useReadingPosition(key: string) {
  const { t } = useTranslation("blog")

  useEffect(() => {
    const saved = readingPositions.read()[key]
    // a link to a section, or a reader already scrolling, knows where they want to be
    if (
      saved !== undefined &&
      saved > 0.1 &&
      saved < 0.9 &&
      !window.location.hash &&
      window.scrollY < 100
    )
      toast(t("post.continue"), {
        id: `continue-${key}`,
        action: {
          label: t("post.continueAction"),
          onClick: () => {
            const room =
              document.documentElement.scrollHeight - window.innerHeight
            window.scrollTo({ top: saved * room })
          },
        },
      })

    let timer: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        rememberPosition(key, progress() > 0.95 ? 1 : progress())
      }, 500)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [key, t])
}
