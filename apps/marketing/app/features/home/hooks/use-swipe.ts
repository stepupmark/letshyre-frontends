import { type PointerEvent, useRef } from "react"

// shorter than this is a tap or a wobble, not a swipe
const SWIPE_PX = 40

/**
 * Touch swipes on an element, reported as reading direction: 1 for onwards, -1 for back.
 * Pair the element with `touch-pan-y` so a sideways swipe reaches it instead of the page.
 */
export function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<number | null>(null)

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      start.current = event.pointerType === "touch" ? event.clientX : null
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (start.current === null) return
      const dx = event.clientX - start.current
      start.current = null
      if (Math.abs(dx) < SWIPE_PX) return
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl"
      onSwipe(dx < 0 !== rtl ? 1 : -1)
    },
    onPointerCancel: () => {
      start.current = null
    },
  }
}
