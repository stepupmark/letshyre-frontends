import { LazyMotion, MotionConfig } from "motion/react"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

// features arrive after first paint; until then elements render without animating
const loadFeatures = () => import("./features").then((mod) => mod.default)

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: duration.base, ease }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
