import { cn } from "@workspace/ui/lib/utils"
import { useScroll } from "motion/react"
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useRef,
} from "react"

import { SceneContext } from "./scene-context"
import { usePlayOnView } from "./use-play-on-view"
import { useStill } from "./use-still"

/**
 * A section `screens` viewports tall that pins its content while scroll drives `progress`.
 * Unpinned, it plays once in view.
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
  const style: CSSProperties & Record<"--screens", number> = {
    "--screens": screens,
  }
  const still = useStill(true)
  const played = usePlayOnView(ref, 2)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  return (
    <section
      ref={ref}
      className={cn("pin:h-[calc(var(--screens)*100svh)] relative", className)}
      style={style}
      {...props}
    >
      <div className="pin:sticky pin:top-0 pin:h-svh pin:overflow-hidden pin:pt-18">
        {/* transforms and inline styles stay bound to the first value, so a switch remounts */}
        <SceneContext
          key={still ? "still" : "live"}
          value={{ progress: still ? played : scrollYProgress, still }}
        >
          {children}
        </SceneContext>
      </div>
    </section>
  )
}
