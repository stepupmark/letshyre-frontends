import { type RefObject, useLayoutEffect, useRef, useState } from "react"

/**
 * True when the nav links don't fit their row. Translations differ too much in length for a
 * breakpoint to work, so this measures. The width they needed is remembered so the header
 * can't flip back and forth at the edge.
 */
export function useCompactNav(
  rowRef: RefObject<HTMLElement | null>,
  navRef: RefObject<HTMLElement | null>,
  key: string
): boolean {
  const [compactFor, setCompactFor] = useState<string | null>(null)
  const needed = useRef(0)
  const compact = compactFor === key

  useLayoutEffect(() => {
    const row = rowRef.current
    const nav = navRef.current
    if (!row || !nav) return

    const check = () => {
      if (compact) {
        if (row.clientWidth >= needed.current) setCompactFor(null)
        return
      }
      const links = [...nav.children]
      // hidden below lg, where CSS already shows the menu
      if (!links.length || !nav.clientWidth) return
      const gap = parseFloat(getComputedStyle(nav).columnGap) || 0
      const content = links.reduce(
        (sum, link) => sum + link.getBoundingClientRect().width,
        gap * (links.length - 1)
      )
      const overflow = content - nav.getBoundingClientRect().width
      // the list hugs its links, so sub-pixel differences aren't overflow
      if (overflow > 1) {
        needed.current = row.clientWidth + Math.ceil(overflow) + 1
        setCompactFor(key)
      }
    }

    let active = true
    check()
    void document.fonts.ready.then(() => {
      if (active) check()
    })
    const observer = new ResizeObserver(check)
    observer.observe(row)
    for (const link of nav.children) observer.observe(link)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [rowRef, navRef, key, compact])

  return compact
}
