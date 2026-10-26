import { useEffect, useRef, useState } from "react"

import type { AssistantMessage } from "../assistant-store"

// on a page, "/" jumps to the input from anywhere that isn't a field
export function useSlashToFocus(input: HTMLTextAreaElement | null) {
  useEffect(() => {
    if (!input) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return
      event.preventDefault()
      input.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
    }
  }, [input])
}

/**
 * Brings a new answer's first line into view while the reader is following,
 * and offers a jump instead when they have scrolled up to re-read.
 */
export function useFollow(last: AssistantMessage | undefined) {
  const log = useRef<HTMLDivElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const atEnd = useRef(true)
  const lastId = useRef(last?.id)
  const [away, setAway] = useState(false)
  const [seen, setSeen] = useState(last?.id)
  const nodeOf = (id: string) =>
    log.current?.querySelector(`[data-message="${id}"]`)

  useEffect(() => {
    lastId.current = last?.id
  })

  // the end tells whether the reader is following; the latest answer counts as seen once in view
  useEffect(() => {
    const ends = end.current
    if (!ends) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === ends) {
          atEnd.current = entry.isIntersecting
          setAway(!entry.isIntersecting)
        }
        if (entry.isIntersecting) setSeen(lastId.current)
      }
    })
    observer.observe(ends)
    const answer =
      last?.role === "assistant"
        ? log.current?.querySelector(`[data-message="${last.id}"]`)
        : null
    if (answer) observer.observe(answer)
    return () => {
      observer.disconnect()
    }
  }, [last?.id, last?.role])

  useEffect(() => {
    if (!last) return
    if (last.role === "user") end.current?.scrollIntoView({ block: "end" })
    else if (atEnd.current)
      log.current
        ?.querySelector(`[data-message="${last.id}"]`)
        ?.scrollIntoView({ block: "start" })
  }, [last])

  return {
    log,
    end,
    unseen: away && last?.role === "assistant" && last.id !== seen,
    jump: () => {
      if (!last) return
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
      nodeOf(last.id)?.scrollIntoView({
        block: "start",
        behavior: reduce ? "auto" : "smooth",
      })
    },
  }
}
