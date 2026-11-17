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
 * A section `screens` viewports tall whose content stays pinned below the header while
 * scroll drives `progress`. Where the `pin` variant doesn't apply it is an ordinary section
 * and scenes render their still layout; the unpinning is CSS, so the prerendered page is
 * already the right height.
 */
export function ScrollScene({
  screens,
  className,
  children,
  ...props
}: Omit<ComponentProps<"section">, "children"> & {
  screens: number
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const still = useStill(true)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  return (
    <section
      ref={ref}
      className={cn("pin:h-[calc(var(--screens)*100svh)] relative", className)}
      style={{ "--screens": screens } as CSSProperties}
      {...props}
    >
      <div className="pin:sticky pin:top-0 pin:h-svh pin:overflow-hidden pin:pt-18">
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
