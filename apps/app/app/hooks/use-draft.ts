import { useEffect, useEffectEvent, useRef, useState } from "react"

import type { fileStore } from "@/lib/file-store"

/** Calls `save` a moment after `watched` stops changing. Returns a save count. */
export function useAutosave(watched: unknown, save: () => void) {
  const [saves, setSaves] = useState(0)
  const json = JSON.stringify(watched)
  const first = useRef(true)
  const onSave = useEffectEvent(() => {
    save()
    setSaves((n) => n + 1)
  })

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const timer = setTimeout(onSave, 600)
    return () => {
      clearTimeout(timer)
    }
  }, [json])

  return saves
}

/** Hands back files kept from before a refresh. True once that's done. Pass `keys` as a constant. */
export function useRestoredFiles(
  store: ReturnType<typeof fileStore>,
  keys: readonly string[],
  onLoad: (files: Record<string, File>) => void
) {
  const [restored, setRestored] = useState(false)
  const load = useEffectEvent(onLoad)

  useEffect(() => {
    let live = true
    void store.load(keys).then((files) => {
      if (!live) return
      load(files)
      setRestored(true)
    })
    return () => {
      live = false
    }
  }, [store, keys])

  return restored
}
