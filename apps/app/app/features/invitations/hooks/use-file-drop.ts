import { useCallback, useEffect, useRef, useState } from "react"

/** Lets a file be dropped on an element; native listeners keep the element a plain box. */
export function useFileDrop(onFile: (file: File) => void) {
  const [dragging, setDragging] = useState(false)
  const latest = useRef(onFile)
  useEffect(() => {
    latest.current = onFile
  })

  const zone = useCallback((element: HTMLElement | null) => {
    if (!element) return
    const over = (event: DragEvent) => {
      event.preventDefault()
      setDragging(true)
    }
    const leave = (event: DragEvent) => {
      if (!element.contains(event.relatedTarget as Node | null))
        setDragging(false)
    }
    const drop = (event: DragEvent) => {
      event.preventDefault()
      setDragging(false)
      const file = event.dataTransfer?.files[0]
      if (file) latest.current(file)
    }
    element.addEventListener("dragover", over)
    element.addEventListener("dragleave", leave)
    element.addEventListener("drop", drop)
    return () => {
      element.removeEventListener("dragover", over)
      element.removeEventListener("dragleave", leave)
      element.removeEventListener("drop", drop)
    }
  }, [])

  return { dragging, zone }
}
