import { useEffect, useRef, useState } from "react"

// the sentinel sits just above a sticky bar; once it passes under the 56px topbar the bar is stuck
export function useStuck() {
  const sentinel = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const node = sentinel.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(entry ? !entry.isIntersecting : false)
      },
      { rootMargin: "-56px 0px 0px 0px" }
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [])

  return { sentinel, stuck }
}
