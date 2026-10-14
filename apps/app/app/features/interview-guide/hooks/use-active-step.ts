import { useEffect, useRef, useState } from "react"

// shrink the viewport to a thin band just above the middle
const band = (top: number, bottom: number) => `-${top}% 0% -${bottom}% 0%`

/** The step crossing the middle of the screen, or the one last picked. */
export function useActiveStep() {
  const [active, setActive] = useState(0)
  const items = useRef<(HTMLElement | null)[]>([])
  // scrolling only takes over once the reader scrolls, and not mid-jump after a pick
  const quietUntil = useRef(Infinity)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (performance.now() < quietUntil.current) return
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.index))
      },
      { rootMargin: band(45, 50) }
    )
    for (const item of items.current) if (item) observer.observe(item)
    const wake = () => {
      quietUntil.current = 0
    }
    window.addEventListener("wheel", wake, { once: true, passive: true })
    window.addEventListener("touchmove", wake, { once: true, passive: true })
    window.addEventListener("keydown", wake, { once: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("wheel", wake)
      window.removeEventListener("touchmove", wake)
      window.removeEventListener("keydown", wake)
    }
  }, [])

  const pick = (index: number) => {
    setActive(index)
    quietUntil.current = performance.now() + 900
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    items.current[index]?.scrollIntoView({
      block: "center",
      behavior: reduce ? "auto" : "smooth",
    })
  }

  const register = (index: number) => (item: HTMLElement | null) => {
    items.current[index] = item
  }

  return { active, pick, register }
}
