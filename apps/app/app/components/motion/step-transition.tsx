import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

/** Slides with the step direction, mirrored for right-to-left languages. */
export function StepTransition({
  step,
  direction,
  dir = "ltr",
  children,
}: {
  step: number | string
  direction: 1 | -1
  dir?: "ltr" | "rtl"
  children: ReactNode
}) {
  const offset = 12 * direction * (dir === "rtl" ? -1 : 1)
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={step}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -offset }}
        transition={{ duration: duration.base, ease }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
