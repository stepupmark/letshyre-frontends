const PREFIX = "draft:v1:"

/** Files can't be stored; they are dropped and the step asks for them again. */
function withoutFiles(value: unknown): unknown {
  if (value instanceof Blob) return undefined
  if (Array.isArray(value))
    return value.map(withoutFiles).filter((v) => v !== undefined)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, withoutFiles(item)] as const)
        .filter(([, item]) => item !== undefined)
    )
  }
  return value
}

export function saveDraft(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(withoutFiles(value)))
  } catch {
    /* storage full or blocked: the form still works, just without resume */
  }
}

export function loadDraft<T>(key: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as Partial<T>) : null
  } catch {
    return null
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* empty */
  }
}

export function clearAllDrafts() {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, i) =>
      localStorage.key(i)
    )
    for (const key of keys)
      if (key?.startsWith(PREFIX)) localStorage.removeItem(key)
  } catch {
    /* empty */
  }
}
