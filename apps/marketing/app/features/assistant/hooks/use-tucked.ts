import { useEffect, useState } from "react"

/** Whether the page is being scrolled down past the first screen; it settles back after a pause. */
export function useTucked() {
  const [tucked, setTucked] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let idle = 0
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - last) > 8) {
        setTucked(y > last && y > window.innerHeight)
        last = y
      }
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        setTucked(false)
      }, 800)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.clearTimeout(idle)
    }
  }, [])

  return tucked
}
