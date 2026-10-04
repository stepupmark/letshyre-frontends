import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import * as m from "motion/react-m"
import { useEffect } from "react"

import { duration, ease } from "@/lib/motion"

export function AnimatedNumber({
  value,
  locale = "en",
}: {
  value: number
  locale?: string
}) {
  const reduce = useReducedMotion()
  const current = useMotionValue(value)
  const text = useTransform(current, (v) =>
    new Intl.NumberFormat(locale).format(Math.round(v))
  )

  useEffect(() => {
    if (reduce) {
      current.set(value)
      return
    }
    const controls = animate(current, value, { duration: duration.slow, ease })
    return () => {
      controls.stop()
    }
  }, [current, value, reduce])

  return <m.span className="tabular-nums">{text}</m.span>
}
