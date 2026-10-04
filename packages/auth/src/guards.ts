import { readSession, ROLES, type Role, type Session } from "./session.ts"

export const ROLE_HOME: Record<Role, string> = {
  [ROLES.employer]: "/employer",
  [ROLES.candidate]: "/employee",
}

/** The marketing site. */
export const PUBLIC_HOME = "/"

/** One sign-in page for both roles; the API says which role signed in. */
export const SIGN_IN = "/sign-in"

export const ONBOARDING = "/employer/onboarding"

type SignedIn = Extract<Session, { status: "signed-in" }>

/** A same-site path, or null. Blocks protocol-relative and backslash tricks. */
export function safeNext(target: unknown): string | null {
  return typeof target === "string" &&
    target.startsWith("/") &&
    !target.startsWith("//") &&
    !target.startsWith("/\\")
    ? target
    : null
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
    return `${SIGN_IN}?${next.toString()}`
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
