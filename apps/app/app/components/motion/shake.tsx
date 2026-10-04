import { useAnimate, useReducedMotion } from "motion/react"
import { useEffect, type ReactNode } from "react"

/** Shakes once whenever `error` changes to a new message; the message itself is always shown. */
export function Shake({
  error,
  children,
}: {
  error: string | undefined
  children: ReactNode
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!error || reduce) return
    void animate(scope.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.3 })
  }, [error, reduce, animate, scope])

  return <div ref={scope}>{children}</div>
}
