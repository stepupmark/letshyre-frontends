import { useEffect, useRef } from "react"

const TYPING = 'input, textarea, select, [contenteditable="true"]'
const OVERLAY = '[role="dialog"], [role="alertdialog"], [role="menu"]'

export function useHotkey(
  keys: string[],
  handler: (event: KeyboardEvent) => void,
  enabled = true
) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  const keyList = keys.join(" ")
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (!keyList.split(" ").includes(event.key)) return
      if (event.target instanceof Element && event.target.closest(TYPING))
        return
      if (document.querySelector(OVERLAY)) return
      handlerRef.current(event)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [keyList, enabled])
}
