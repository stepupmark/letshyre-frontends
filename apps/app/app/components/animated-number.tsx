import { animate, useMotionValue, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

import { duration, ease } from "@/lib/motion"

// state, not an m.span: a count that ended before the lazy motion features loaded stuck at its start
export function AnimatedNumber({
  value,
  locale = "en",
  from,
}: {
  value: number
  locale?: string
  // start the first count here, e.g. 0 so a figure rolls up as it arrives
  from?: number
}) {
  const reduce = useReducedMotion()
  const current = useMotionValue(from ?? value)
  const [shown, setShown] = useState(from ?? value)

  useEffect(() => {
    const controls = animate(current, value, {
      duration: reduce ? 0 : duration.slow,
      ease,
      onUpdate: (v) => {
        setShown(Math.round(v))
      },
      onComplete: () => {
        setShown(value)
      },
    })
    return () => {
      controls.stop()
    }
  }, [current, value, reduce])

  return (
    <span className="tabular-nums">
      {new Intl.NumberFormat(locale).format(shown)}
    </span>
  )
}
