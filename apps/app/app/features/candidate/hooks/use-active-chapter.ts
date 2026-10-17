import { useEffect, useState } from "react"

const band = (top: number, bottom: number) => `-${top}% 0% -${bottom}% 0%`

/** The chapter whose top last crossed the upper third of the screen. */
export function useActiveChapter(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "")
  const key = ids.join(",")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: band(20, 70) }
    )
    for (const id of key.split(",")) {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    }
    return () => {
      observer.disconnect()
    }
  }, [key])

  return active
}
