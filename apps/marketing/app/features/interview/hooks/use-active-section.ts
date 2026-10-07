import { useEffect, useState } from "react"

// just below the sticky header, matching the sections' scroll-mt-24
const OFFSET = 120

/** The last of `ids` whose top has scrolled past the header, for the table of contents. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>()

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setActive(
        ids.findLast(
          (id) =>
            (document.getElementById(id)?.getBoundingClientRect().top ??
              Infinity) <= OFFSET
        )
      )
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ids])

  return active
}
