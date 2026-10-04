import { useEffect, useState, useSyncExternalStore } from "react"

/** Shown one at a time, in this order, once each. */
const TIPS = ["search", "credits"] as const
export type TipId = (typeof TIPS)[number]

const KEY = "tips:v1:seen"
const listeners = new Set<() => void>()

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? ""
  } catch {
    // storage blocked: treat every tip as seen rather than repeat them each visit
    return TIPS.join(",")
  }
}

function write(value: string) {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    /* empty */
  }
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function dismissTip(id: TipId) {
  write([...new Set([...read().split(","), id])].filter(Boolean).join(","))
}

/** From the user menu: show the tips again. */
export const restartTips = () => {
  write("")
}

/** The tip to show now, after the page has settled so it doesn't pop in mid-load. */
export function useCurrentTip(available: readonly TipId[]): TipId | null {
  const seen = useSyncExternalStore(subscribe, read, () => TIPS.join(","))
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(true)
    }, 800)
    return () => {
      clearTimeout(timer)
    }
  }, [])
  if (!settled) return null
  const done = seen.split(",")
  return TIPS.find((id) => available.includes(id) && !done.includes(id)) ?? null
}
