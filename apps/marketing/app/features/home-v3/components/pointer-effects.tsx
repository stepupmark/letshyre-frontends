import { cn } from "@workspace/ui/lib/utils"
import { useSpring } from "motion/react"
import * as m from "motion/react-m"
import type { PointerEvent, ReactNode } from "react"

import { useFinePointer } from "./use-fine-pointer"

const SPRING = { stiffness: 260, damping: 22, mass: 0.4 }

export function Magnetic({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const active = useFinePointer()
  const x = useSpring(0, SPRING)
  const y = useSpring(0, SPRING)

  const follow = (event: PointerEvent<HTMLSpanElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - box.left - box.width / 2) * 0.2)
    y.set((event.clientY - box.top - box.height / 2) * 0.3)
  }
  const release = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.span
      style={{ x, y }}
      onPointerMove={active ? follow : undefined}
      onPointerLeave={release}
      className={cn("inline-flex", className)}
    >
      {children}
    </m.span>
  )
}

export function Tilt({
  max = 4,
  className,
  children,
}: {
  max?: number
  className?: string
  children: ReactNode
}) {
  const active = useFinePointer()
  const rotateX = useSpring(0, SPRING)
  const rotateY = useSpring(0, SPRING)

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    rotateY.set(((event.clientX - box.left) / box.width - 0.5) * 2 * max)
    rotateX.set(((event.clientY - box.top) / box.height - 0.5) * -2 * max)
  }
  const release = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <m.div
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={active ? follow : undefined}
      onPointerLeave={release}
      className={className}
    >
      {children}
    </m.div>
  )
}
