const KEY = "lh_assistant_session"

// storage can throw in private mode; the chat still works without it
export function readSessionId(): string | undefined {
  try {
    return sessionStorage.getItem(KEY) ?? undefined
  } catch {
    return undefined
  }
}

export function writeSessionId(id: string | undefined) {
  try {
    if (id) sessionStorage.setItem(KEY, id)
    else sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
