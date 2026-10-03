import { useEffect, useState } from "react"
import { useNavigation } from "react-router"

/** A thin bar at the top, shown only when a navigation takes longer than `delayMs`. */
export function NavigationProgress({
  label,
  delayMs = 300,
}: {
  label: string
  delayMs?: number
}) {
  const busy = useNavigation().state !== "idle"
  const [late, setLate] = useState(false)

  useEffect(() => {
    if (!busy) return
    const timer = setTimeout(() => {
      setLate(true)
    }, delayMs)
    return () => {
      clearTimeout(timer)
      setLate(false)
    }
  }, [busy, delayMs])

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      {busy && late && (
        <>
          <div className="h-0.5 w-full animate-pulse bg-primary motion-reduce:animate-none" />
          <span className="sr-only">{label}</span>
        </>
      )}
    </div>
  )
}
