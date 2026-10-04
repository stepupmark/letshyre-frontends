import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, spring } from "@/lib/motion"

/** List items that slide into place when others are added or removed. */
export function AnimatedList<T>({
  items,
  getKey,
  children,
  className,
  itemClassName,
}: {
  items: readonly T[]
  getKey: (item: T) => string | number
  children: (item: T) => ReactNode
  className?: string
  itemClassName?: string
}) {
  return (
    <ul className={className}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <m.li
            key={getKey(item)}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: duration.fast } }}
            transition={spring}
            className={itemClassName}
          >
            {children(item)}
          </m.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
