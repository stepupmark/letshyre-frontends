import { readSession, ROLES, type Role, type Session } from "./session.ts"

export const ROLE_HOME: Record<Role, string> = {
  [ROLES.employer]: "/employer/dashboard",
  [ROLES.candidate]: "/employee/jobs",
  [ROLES.admin]: "/dashboard",
}

/** The marketing site. */
export const PUBLIC_HOME = "/"

export const SIGN_IN = "/sign-in"

export const ROLE_SIGN_IN: Record<Role, string> = {
  [ROLES.employer]: "/employer/sign-in",
  [ROLES.candidate]: "/employee/sign-in",
  [ROLES.admin]: SIGN_IN,
}

/** A page open to one role signs in on that role's page; anything else asks. */
function signInFor(roles: Role[]) {
  const [only] = roles
  return only && roles.length === 1 ? ROLE_SIGN_IN[only] : SIGN_IN
}

export const ONBOARDING = "/employer/onboarding"

type SignedIn = Extract<Session, { status: "signed-in" }>

const SELF = "https://self.invalid"

/** A same-site path, or null. */
export function safeNext(target: unknown): string | null {
  if (typeof target !== "string" || !target.startsWith("/")) return null
  // resolve like a browser would: it strips tabs and newlines, so "/\t/x.com" is "//x.com"
  const url = new URL(target, SELF)
  return url.origin === SELF ? url.pathname + url.search + url.hash : null
}

export function homeFor(session: SignedIn) {
  return session.role === ROLES.employer &&
    session.user.is_profile_completed === false
    ? ONBOARDING
    : ROLE_HOME[session.role]
}

/** Where a protected page has to send this visitor instead, or null to let them in. */
export function authRedirect(
  url: URL,
  { roles = [] }: { roles?: Role[] } = {}
): string | null {
  const session = readSession()

  if (session.status !== "signed-in") {
    const next = new URLSearchParams({ next: url.pathname + url.search })
    return `${signInFor(roles)}?${next.toString()}`
  }

  if (roles.length > 0 && !roles.includes(session.role)) return homeFor(session)

  if (session.role === ROLES.employer) {
    const onOnboarding = url.pathname.startsWith(ONBOARDING)
    const completed = session.user.is_profile_completed
    if (completed === false && !onOnboarding) return ONBOARDING
    if (completed === true && onOnboarding) return ROLE_HOME[session.role]
  }

  return null
}

/** Signed-in visitors skip sign-in and registration pages. */
export function guestRedirect(): string | null {
  const session = readSession()
  return session.status === "signed-in" ? homeFor(session) : null
}
