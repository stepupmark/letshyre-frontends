import { useEffect, useState } from "react"

/**
 * Id of the last heading scrolled past the top third of the viewport. At the very bottom
 * it's the last one, since short closing sections never reach that line.
 */
export function useActiveSection(ids: readonly string[]): string | undefined {
  const [active, setActive] = useState<string>()
  const key = ids.join("|")

  useEffect(() => {
    const headings = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    let frame = 0
    const update = () => {
      frame = 0
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      let current = headings[0]?.id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > window.innerHeight / 3) break
        current = heading.id
      }
      setActive(atBottom ? headings.at(-1)?.id : current)
    }
    const schedule = () => {
      frame ||= requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [key])

  return active
}
