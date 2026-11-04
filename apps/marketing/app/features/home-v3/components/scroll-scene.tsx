import { cn } from "@workspace/ui/lib/utils"
import { useReducedMotion, useScroll } from "motion/react"
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useRef,
} from "react"

import { useHydrated } from "@/hooks/use-hydrated"

import { SceneContext, settled } from "./scene-context"

/**
 * A section `screens` viewports tall whose content stays pinned while scroll drives
 * `progress`, from `pinFrom` up if given. With reduced motion it is an ordinary section and scenes render their still
 * layout; the unpinning is CSS, so the prerendered page is already the right height.
 */
export function ScrollScene({
  screens,
  pinFrom,
  className,
  children,
  ...props
}: Omit<ComponentProps<"section">, "children"> & {
  screens: number
  pinFrom?: "md"
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion() ?? false
  const still = useHydrated() && reduced
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
          ? "md:motion-safe:h-[calc(var(--screens)*100svh)]"
          : "motion-safe:h-[calc(var(--screens)*100svh)]",
        className
      )}
      style={{ "--screens": screens } as CSSProperties}
      {...props}
    >
      <div
        className={
          pinFrom
            ? "md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-svh md:motion-safe:overflow-hidden"
            : "motion-safe:sticky motion-safe:top-0 motion-safe:h-svh motion-safe:overflow-hidden"
        }
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
