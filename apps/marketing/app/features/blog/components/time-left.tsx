import { useTranslation } from "@workspace/i18n/react"
import { type RefObject, useEffect, useState } from "react"

/** Minutes left in the article, from how far the reader has scrolled through it. */
function useMinutesLeft(
  article: RefObject<HTMLElement | null>,
  minutes: number
): number | undefined {
  const [left, setLeft] = useState<number>()

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = article.current?.getBoundingClientRect()
        if (!box) return
        const read = (window.innerHeight - box.top) / box.height
        setLeft(
          read <= 0.15 || read >= 1
            ? undefined
            : Math.ceil(minutes * (1 - read))
        )
      })
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [article, minutes])

  return left
}

export default function TimeLeft({
  article,
  minutes,
}: {
  article: RefObject<HTMLElement | null>
  minutes: number
}) {
  const { t } = useTranslation("blog")
  const left = useMinutesLeft(article, minutes)

  return (
    <p
      aria-hidden
      data-shown={left !== undefined || undefined}
      className="pointer-events-none fixed inset-s-4 bottom-4 z-40 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground tabular-nums opacity-0 transition-opacity duration-300 data-shown:opacity-100 motion-reduce:transition-none sm:inset-s-6 sm:bottom-6 print:hidden"
    >
      {left === undefined
        ? null
        : left <= 1
          ? t("post.almostDone")
          : t("post.timeLeft", { count: left })}
    </p>
  )
}
