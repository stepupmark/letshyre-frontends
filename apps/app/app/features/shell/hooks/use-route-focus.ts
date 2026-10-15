import { useEffect, useRef } from "react"
import { useLocation } from "react-router"

/** After a client navigation, screen readers and keyboard users start at the new page's title. */
export function useRouteFocus() {
  const { pathname } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    document
      .querySelector<HTMLElement>("#main h1")
      ?.focus({ preventScroll: true })
  }, [pathname])
}
