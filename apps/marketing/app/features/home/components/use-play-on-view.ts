import { motionValue, useInView, useReducedMotion } from "motion/react"
import { type RefObject, useEffect, useState } from "react"

import { settled } from "./scene-context"

/**
 * Progress for a scene that isn't scroll-driven: it plays from 0 to 1 over `seconds` the
 * first time the element is a third in view, so the scene still tells its story on phones.
 */
export function usePlayOnView(ref: RefObject<Element | null>, seconds: number) {
  const reduced = useReducedMotion()
  const [progress] = useState(() => motionValue(0))
  const inView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (!inView || reduced) return
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (seconds * 1000))
      progress.set(p)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [inView, reduced, progress, seconds])

  return reduced ? settled : progress
}
