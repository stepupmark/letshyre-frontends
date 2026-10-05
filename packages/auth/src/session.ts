// Same localStorage keys as the legacy app, so people stay signed in across the switch.
const KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
  user: "user",
} as const

const CHAT_PREFIX = "chat:v1:"
const PUBLIC_CHAT = `${CHAT_PREFIX}public`

export const ROLES = { employer: "Employer", candidate: "Candidate" } as const
export type Role = (typeof ROLES)[keyof typeof ROLES]

export interface User {
  role: Role
  is_profile_completed?: boolean
  [key: string]: unknown
}

export type Session =
  { status: "guest" } | { status: "signed-in"; role: Role; user: User }

const GUEST: Session = { status: "guest" }
const isRole = (value: unknown): value is Role =>
  value === ROLES.employer || value === ROLES.candidate

function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

// storage can throw when blocked or full; a failed write just means no session
function read(key: string) {
  try {
    return store()?.getItem(key) ?? null
  } catch {
    return null
  }
}
function write(key: string, value: string) {
  try {
    store()?.setItem(key, value)
  } catch {
    /* empty */
  }
}
function remove(key: string) {
  try {
    store()?.removeItem(key)
  } catch {
    /* empty */
  }
}

export const getAccessToken = () => read(KEYS.access)
export const getRefreshToken = () => read(KEYS.refresh)

const listeners = new Set<() => void>()
const notify = () => {
  for (const listener of listeners) listener()
}

export function saveTokens(access: string, refresh?: string) {
  write(KEYS.access, access)
  if (refresh) write(KEYS.refresh, refresh)
  notify()
}

/** Refresh tokens live under their own key, never inside the user record. */
function withoutTokens(record: Record<string, unknown>) {
  const {
    refresh_token: _r,
    refresh: _rr,
    access_token: _a,
    access: _aa,
    token: _t,
    ...user
  } = record
  return user
}

export function saveUser(record: Record<string, unknown>) {
  write(KEYS.user, JSON.stringify(withoutTokens(record)))
  notify()
}

/** Merges into the stored user, e.g. once onboarding is done. */
export function updateUser(patch: Partial<User>) {
  const session = readSession()
  if (session.status === "signed-in") saveUser({ ...session.user, ...patch })
}

let cached: { raw: string | null; session: Session } = {
  raw: null,
  session: GUEST,
}

/** Stable between calls while storage is unchanged, as useSyncExternalStore needs. */
export function readSession(): Session {
  const raw = read(KEYS.user)
  if (raw === cached.raw) return cached.session

  let session = GUEST
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed === "object") {
      const user = withoutTokens(parsed as Record<string, unknown>)
      if (isRole(user.role)) {
        session = { status: "signed-in", role: user.role, user: user as User }
      }
    }
  } catch {
    /* malformed record counts as signed out */
  }
  cached = { raw, session }
  return session
}

/** Removes the auth keys and signed-in chats; drafts and other app storage stay. */
export function clearSession() {
  remove(KEYS.access)
  remove(KEYS.refresh)
  remove(KEYS.user)
  try {
    const chats = window.sessionStorage
    const keys = Array.from({ length: chats.length }, (_, i) => chats.key(i))
    for (const key of keys) {
      if (key?.startsWith(CHAT_PREFIX) && key !== PUBLIC_CHAT)
        chats.removeItem(key)
    }
  } catch {
    /* empty */
  }
  notify()
}

const AUTH_KEYS = new Set<string | null>([...Object.values(KEYS), null])

/** Fires on changes in this tab and, through the storage event, in every other tab. */
export function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (AUTH_KEYS.has(event.key)) listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}
