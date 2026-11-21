import { cn } from "@workspace/ui/lib/utils"
import { useMotionValue } from "motion/react"
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
} from "react"

import { pinProgress } from "../lib/pin"
import { SceneContext } from "./scene-context"
import { usePlayOnView } from "./use-play-on-view"
import { useStill } from "./use-still"

type Size =
  /** a stage one screen tall, up to `--scene-stage`, held for `screens - 1` more of them */
  | { screens: number; fit?: never }
  /** a stage as tall as its content, held for `--scene-hold` under the header */
  | { fit: "content"; screens?: never }

/**
 * A section that pins its stage while scroll drives `progress`. Unpinned, it plays once in
 * view.
 */
export function ScrollScene({
  screens,
  fit,
  className,
  children,
  ...props
}: Omit<ComponentProps<"section">, "children"> &
  Size & { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const style: CSSProperties & Record<"--screens", number> = {
    "--screens": screens ?? 1,
  }
  const still = useStill(true)
  const played = usePlayOnView(ref, 2)
  const pinned = usePinProgress(ref)

  return (
    <section
      ref={ref}
      className={cn(
        "relative",
        fit !== "content" && "pin:h-[calc(var(--screens)*var(--scene-stage))]",
        className
      )}
      style={fit === "content" ? undefined : style}
      {...props}
    >
      <div
        className={cn(
          "pin:sticky pin:overflow-hidden pin:pt-18",
          fit === "content"
            ? "pin:top-0"
            : "pin:top-[max(0px,calc((100svh-var(--scene-stage))/2))] pin:h-(--scene-stage)"
        )}
      >
        {/* transforms and inline styles stay bound to the first value, so a switch remounts */}
        <SceneContext
          key={still ? "still" : "live"}
          value={{ progress: still ? played : pinned, still }}
        >
          {children}
        </SceneContext>
      </div>
      {fit === "content" ? (
        <div aria-hidden className="pin:h-(--scene-hold)" />
      ) : null}
    </section>
  )
}

function usePinProgress(ref: RefObject<HTMLElement | null>) {
  const progress = useMotionValue(0)

  // the pin depends on the section's place and size, so it is read again on resize too
  useEffect(() => {
    const update = () => {
      if (ref.current) progress.set(pinProgress(ref.current))
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [ref, progress])

  return progress
}
