import { cn } from "@workspace/ui/lib/utils"
import { useScroll } from "motion/react"
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useRef,
} from "react"

import { SceneContext, settled } from "./scene-context"
import { useStill } from "./use-still"

/**
 * A section `screens` viewports tall whose content stays pinned while scroll drives
 * `progress`, from `pinFrom` up if given. Below that, and with reduced motion, it is an
 * ordinary section and scenes render their still layout; the unpinning is CSS, so the
 * prerendered page is already the right height.
 */
export function ScrollScene({
  screens,
  pinFrom,
  className,
  children,
  ...props
}: Omit<ComponentProps<"section">, "children"> & {
  screens: number
  pinFrom?: "lg"
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const still = useStill(pinFrom !== undefined)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  return (
    <section
      ref={ref}
      className={cn(
        "relative",
        pinFrom
          ? "lg:motion-safe:h-[calc(var(--screens)*100svh)]"
          : "motion-safe:h-[calc(var(--screens)*100svh)]",
        className
      )}
      style={{ "--screens": screens } as CSSProperties}
      {...props}
    >
      <div
        className={
          pinFrom
            ? "lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-svh lg:motion-safe:overflow-hidden"
            : "motion-safe:sticky motion-safe:top-0 motion-safe:h-svh motion-safe:overflow-hidden"
        }
      >
        {/* transforms and inline styles stay bound to the first value, so a switch remounts */}
        <SceneContext
          key={still ? "still" : "live"}
          value={{ progress: still ? settled : scrollYProgress, still }}
        >
          {children}
        </SceneContext>
      </div>
    </section>
  )
}
