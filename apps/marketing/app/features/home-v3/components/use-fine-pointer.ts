import { useReducedMotion } from "motion/react"
import { useSyncExternalStore } from "react"

const finePointer = () =>
  // a media query, not classes; the rule reads "hover:" as a variant
  // eslint-disable-next-line local/no-class-constants
  window.matchMedia("(hover: hover) and (pointer: fine)")

const subscribe = (onChange: () => void) => {
  const query = finePointer()
  query.addEventListener("change", onChange)
  return () => {
    query.removeEventListener("change", onChange)
  }
}

/** True for a mouse or trackpad with motion allowed; pointer effects are off otherwise. */
export function useFinePointer() {
  const reduced = useReducedMotion() ?? false
  const fine = useSyncExternalStore(
    subscribe,
    () => finePointer().matches,
    () => false
  )
  return fine && !reduced
}
