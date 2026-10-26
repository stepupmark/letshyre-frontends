import { useEffect, type RefObject } from "react"

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

/** j and k move focus between the rows' [data-row-open] targets. */
export function useRowKeys(
  enabled: boolean,
  body: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (typing(event.target) || event.metaKey || event.ctrlKey) return
      if (event.key !== "j" && event.key !== "k") return
      const targets = [
        ...(body.current?.querySelectorAll<HTMLElement>("[data-row-open]") ??
          []),
      ]
      if (!targets.length) return
      const current = targets.indexOf(document.activeElement as HTMLElement)
      const next =
        current === -1
          ? 0
          : Math.min(
              Math.max(current + (event.key === "j" ? 1 : -1), 0),
              targets.length - 1
            )
      targets[next]?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [enabled, body])
}
