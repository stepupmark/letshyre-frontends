import { ROLE_SIGN_IN, ROLES, SIGN_IN, type Role } from "@workspace/auth"
import { href } from "react-router"

/** Who an auth page is for. The URL says "employee"; the copy says job seeker. */
export type Audience = "employer" | "candidate"

export const ROLE_OF = {
  employer: ROLES.employer,
  candidate: ROLES.candidate,
} as const satisfies Record<Audience, Role>

export const audienceFromPath = (pathname: string): Audience | null =>
  pathname.startsWith("/employer/")
    ? "employer"
    : pathname.startsWith("/employee/")
      ? "candidate"
      : null

export const signInPath = (audience: Audience | null) =>
  audience ? ROLE_SIGN_IN[ROLE_OF[audience]] : SIGN_IN

export const REGISTER_PATH = {
  employer: href("/employer/register"),
  candidate: href("/employee/register"),
} as const satisfies Record<Audience, string>

const LAST = "lastSignIn"

/** The side this device last signed in on, so the picker can lead with it. */
export function lastAudience(): Audience | null {
  try {
    const value = localStorage.getItem(LAST)
    return value === "employer" || value === "candidate" ? value : null
  } catch {
    return null
  }
}

export function rememberAudience(audience: Audience) {
  try {
    localStorage.setItem(LAST, audience)
  } catch {
    /* empty */
  }
}
