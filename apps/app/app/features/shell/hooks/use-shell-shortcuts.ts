import { useEffect, type Dispatch, type SetStateAction } from "react"

type Setter = Dispatch<SetStateAction<boolean>>

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

/** Ctrl K / ⌘K toggles search and "?" opens the shortcut list; Ctrl B belongs to the sidebar. */
export function useShellShortcuts(setSearchOpen: Setter, setHelpOpen: Setter) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      } else if (event.key === "?" && !typing(event.target)) {
        setHelpOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [setSearchOpen, setHelpOpen])
}
