import { useEffect, useState } from "react"

// skeletons wait a beat so fast responses don't flash
export function useDelayed(active: boolean, ms = 300) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!active) return
    const id = setTimeout(() => {
      setShown(true)
    }, ms)
    return () => {
      clearTimeout(id)
      setShown(false)
    }
  }, [active, ms])

  return active && shown
}
