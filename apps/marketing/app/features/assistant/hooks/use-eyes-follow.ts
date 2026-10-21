import { useEffect, useRef } from "react"

// in face units (the drawing is 64 wide); further and the eyes leave the bubble
const REACH = 2.5
// how far away the pointer has to be for the eyes to look all the way
const FULL_LOOK_PX = 240

/** Turns the eyes toward the pointer by setting --look-x and --look-y on the drawing. */
export function useEyesFollow<T extends SVGElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const face = ref.current
    if (!face) return
    const mouse = matchMedia("(pointer: fine)").matches
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!mouse || reduce) return

    // the drawing is mirrored in RTL, so screen-right is drawing-left there
    const flip = getComputedStyle(face).direction === "rtl" ? -1 : 1
    let frame = 0
    const look = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = face.getBoundingClientRect()
        const dx = event.clientX - (box.left + box.width / 2)
        const dy = event.clientY - (box.top + box.height / 2)
        const distance = Math.hypot(dx, dy) || 1
        const pull = (Math.min(distance, FULL_LOOK_PX) / FULL_LOOK_PX) * REACH
        face.style.setProperty(
          "--look-x",
          `${((dx / distance) * pull * flip).toFixed(2)}px`
        )
        face.style.setProperty(
          "--look-y",
          `${((dy / distance) * pull).toFixed(2)}px`
        )
      })
    }

    window.addEventListener("pointermove", look, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", look)
    }
  }, [])

  return ref
}
