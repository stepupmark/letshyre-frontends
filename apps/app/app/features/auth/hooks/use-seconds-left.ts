import { useEffect, useState } from "react"

/** Whole seconds until `deadline`, worked out from the clock so sleeping tabs stay right. */
export function useSecondsLeft(deadline: number, max: number) {
  const [now, setNow] = useState(Date.now)
  const left = Math.min(max, Math.max(0, Math.ceil((deadline - now) / 1000)))
  const running = left > 0

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [deadline, running])

  return left
}
