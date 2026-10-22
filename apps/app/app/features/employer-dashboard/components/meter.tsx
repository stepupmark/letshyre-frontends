import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

export function Meter({ value, label }: { value: number; label: string }) {
  const percent = Math.round(Math.min(100, Math.max(0, value)))
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="block h-1.5 overflow-hidden rounded-full bg-muted"
    >
      <span className="block h-full" style={{ width: `${percent}%` }}>
        <m.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: duration.slow, ease }}
          className="block h-full origin-left rounded-full bg-brand rtl:origin-right"
        />
      </span>
    </span>
  )
}
