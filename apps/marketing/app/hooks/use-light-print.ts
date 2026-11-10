import { useEffect } from "react"

/** Prints in the light theme, so dark-mode text and diagrams don't land on white paper. */
export function useLightPrint() {
  useEffect(() => {
    const root = document.documentElement
    let wasDark = false
    const before = () => {
      wasDark = root.classList.contains("dark")
      root.classList.remove("dark")
    }
    const after = () => {
      if (wasDark) root.classList.add("dark")
    }
    window.addEventListener("beforeprint", before)
    window.addEventListener("afterprint", after)
    return () => {
      window.removeEventListener("beforeprint", before)
      window.removeEventListener("afterprint", after)
    }
  }, [])
}
