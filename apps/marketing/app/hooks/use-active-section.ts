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

    // a scroll check, not an observer: a fast fling can carry a heading past the line unseen
    const update = () => {
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

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [key])

  return active
}
