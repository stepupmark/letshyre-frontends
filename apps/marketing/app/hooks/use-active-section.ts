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

    // the answer only changes when a heading crosses the line or the page bottoms out
    const line = new IntersectionObserver(update, {
      rootMargin: "0px 0px -66% 0px",
    })
    headings.forEach((heading) => {
      line.observe(heading)
    })
    const end = document.createElement("div")
    end.setAttribute("aria-hidden", "true")
    document.body.append(end)
    const bottom = new IntersectionObserver(update)
    bottom.observe(end)

    return () => {
      line.disconnect()
      bottom.disconnect()
      end.remove()
    }
  }, [key])

  return active
}
