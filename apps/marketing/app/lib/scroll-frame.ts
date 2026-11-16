// One passive scroll and resize listener for the page, run at most once a frame, so components
// that read layout as the reader scrolls don't each force it on every event.
const callbacks = new Set<() => void>()
let frame = 0

const run = () => {
  frame = 0
  for (const callback of callbacks) callback()
}

const schedule = () => {
  frame ||= requestAnimationFrame(run)
}

/** Calls `callback` once a frame while the page scrolls or resizes; returns the unsubscribe. */
export function onScrollFrame(callback: () => void): () => void {
  if (callbacks.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
  }
  callbacks.add(callback)
  return () => {
    callbacks.delete(callback)
    if (callbacks.size > 0) return
    window.removeEventListener("scroll", schedule)
    window.removeEventListener("resize", schedule)
    cancelAnimationFrame(frame)
    frame = 0
  }
}
