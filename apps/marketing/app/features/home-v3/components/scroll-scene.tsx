import { cn } from "@workspace/ui/lib/utils"
import { useReducedMotion, useScroll } from "motion/react"
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useRef,
} from "react"

import { SceneContext, settled } from "./scene-context"

/**
 * A section `screens` viewports tall whose content stays pinned while scroll drives
 * `progress`. With reduced motion it is an ordinary section and scenes render settled;
 * the pinning is CSS so prerendered HTML is already right before hydration.
 */
export function ScrollScene({
  screens,
  className,
  stageClassName,
  children,
  ...props
}: Omit<ComponentProps<"section">, "children"> & {
  screens: number
  stageClassName?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const still = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  return (
    <section
      ref={ref}
      className={cn(
        "relative motion-safe:h-[calc(var(--screens)*100svh)]",
        className
      )}
      style={{ "--screens": screens } as CSSProperties}
      {...props}
    >
      <div
        className={cn(
          "motion-safe:sticky motion-safe:top-0 motion-safe:h-svh motion-safe:overflow-hidden",
          stageClassName
        )}
      >
        <SceneContext
          value={{ progress: still ? settled : scrollYProgress, still }}
        >
          {children}
        </SceneContext>
      </div>
    </section>
  )
}
