import * as m from "motion/react-m"

import { duration, ease } from "@/lib/motion"

/** A 0–100 score as a labelled bar that fills once, the first time it scrolls into view. */
export function Meter({
  label,
  value,
  index = 0,
}: {
  label: string
  value: number
  index?: number
}) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <li className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_2.5rem]">
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-muted print:border">
        <span className="block h-full" style={{ width: `${clamped}%` }}>
          <m.span
            className="block h-full origin-left rounded-full bg-primary rtl:origin-right print:transform-none!"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: duration.slow, ease, delay: index * 0.04 }}
          />
        </span>
      </span>
      <span className="text-end tabular-nums">{clamped}</span>
    </li>
  )
}
