import { useRef, useState } from "react"

import type {
  FieldMenuBridge,
  FieldMenuProps,
} from "../lib/editor/field-suggestion"
import type { MergeField } from "../lib/merge-fields"

export interface FieldMenuState {
  items: MergeField[]
  active: number
  rect: DOMRect | null
  pick: (key: MergeField) => void
}

/** The {{ menu's state, fed by the Tiptap suggestion plugin outside React. */
export function useFieldMenu() {
  const [menu, setMenu] = useState<FieldMenuState | null>(null)
  const current = useRef<FieldMenuState | null>(null)
  const update = (next: FieldMenuState | null) => {
    current.current = next
    setMenu(next)
  }

  const [bridge] = useState<FieldMenuBridge>(() => ({
    show: (props: FieldMenuProps) => {
      const previous = current.current
      update({
        items: props.items,
        active: previous
          ? Math.min(previous.active, Math.max(props.items.length - 1, 0))
          : 0,
        rect: props.clientRect?.() ?? null,
        pick: (key) => {
          props.command(key)
        },
      })
    },
    hide: () => {
      update(null)
    },
    keyDown: ({ event }) => {
      const state = current.current
      if (!state || state.items.length === 0) return false
      const count = state.items.length
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const step = event.key === "ArrowDown" ? 1 : -1
        update({ ...state, active: (state.active + step + count) % count })
        return true
      }
      if (event.key === "Enter" || event.key === "Tab") {
        const key = state.items[state.active]
        if (key) state.pick(key)
        return true
      }
      if (event.key === "Escape") {
        update(null)
        return true
      }
      return false
    },
  }))

  return { bridge, menu }
}
