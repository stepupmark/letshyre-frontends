import { useEffect, useState } from "react"

/** Id of the last heading that has scrolled past the top band of the viewport. */
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
      let current: string | undefined
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > window.innerHeight * 0.3)
          break
        current = heading.id
      }
      setActive(current ?? headings[0]?.id)
    }

    const observer = new IntersectionObserver(update, {
      rootMargin: "0px 0px -70% 0px",
    })
    for (const heading of headings) observer.observe(heading)
    update()
    return () => {
      observer.disconnect()
    }
  }, [key])

  return active
}
