import { useEffect, useRef } from "react"
import { useBlocker } from "react-router"

export function useLeaveGuard(dirty: boolean) {
  const released = useRef(false)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !released.current &&
      currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => {
      window.removeEventListener("beforeunload", warn)
    }
  }, [dirty])

  return {
    blocker,
    release: () => {
      released.current = true
    },
  }
}
