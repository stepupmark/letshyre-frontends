import { useEffect, useRef } from "react"
import { useLocation } from "react-router"

/**
 * After a client navigation, moves focus to the new page's h1 (or `#main`) so
 * screen readers announce it and Tab starts from the content, not the old link.
 */
export function useRouteFocus() {
  const { pathname, hash } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    // an anchor link scrolls to its own target
    if (hash) return
    // a lazy page paints its heading a frame after the route commits
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById("main")
      // the page already put focus somewhere on purpose, e.g. a field to fix
      if (!main || main.contains(document.activeElement)) return
      const target = main.querySelector<HTMLElement>("h1") ?? main
      if (!target.hasAttribute("tabindex")) target.tabIndex = -1
      target.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [pathname, hash])
}
