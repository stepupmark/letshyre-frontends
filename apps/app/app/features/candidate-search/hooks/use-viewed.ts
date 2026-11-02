import { useState } from "react"

const KEY = "candidate-search:viewed"

const load = (): ReadonlySet<string> => {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "[]")
    return new Set(Array.isArray(saved) ? saved.map(String) : [])
  } catch {
    return new Set()
  }
}

export function useViewed() {
  const [viewed, setViewed] = useState(load)

  const markViewed = (key: string) => {
    if (viewed.has(key)) return
    const next = new Set(viewed).add(key)
    setViewed(next)
    try {
      sessionStorage.setItem(KEY, JSON.stringify([...next]))
    } catch {
      // private mode or full storage: the marker just won't survive a reload
    }
  }

  return { viewed, markViewed }
}
