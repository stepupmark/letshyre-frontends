import { useEffect, useState } from "react"

import { useHydrated } from "./use-hydrated"

/** Copies text to the clipboard; `copied` stays true for two seconds. */
export function useCopy() {
  const [copied, setCopied] = useState(false)
  const canCopy = useHydrated() && "clipboard" in navigator

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => {
      setCopied(false)
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
  }, [copied])

  const copy = (text: string) =>
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        return true
      },
      () => false
    )

  return { canCopy, copied, copy }
}
