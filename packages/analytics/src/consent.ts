import { useSyncExternalStore } from "react"

import { getConfig } from "./config.ts"

export const CONSENT_COOKIE = "lh_consent"
const SIX_MONTHS = 60 * 60 * 24 * 182

export interface Consent {
  v: 1
  analytics: boolean
  ts: number
}

const listeners = new Set<() => void>()
let snapshot: { cookie: string; consent: Consent | null } | null = null

export function parseConsent(cookie: string): Consent | null {
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name !== CONSENT_COOKIE) continue
    try {
      const value = JSON.parse(
        decodeURIComponent(rest.join("="))
      ) as Partial<Consent>
      if (
        value.v === 1 &&
        typeof value.analytics === "boolean" &&
        typeof value.ts === "number"
      ) {
        return { v: 1, analytics: value.analytics, ts: value.ts }
      }
    } catch {
      return null
    }
  }
  return null
}

/** `null` until the visitor has chosen. */
export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null
  // cached so useSyncExternalStore gets a stable object
  if (snapshot?.cookie !== document.cookie) {
    snapshot = {
      cookie: document.cookie,
      consent: parseConsent(document.cookie),
    }
  }
  return snapshot.consent
}

export function setConsent(analytics: boolean) {
  const { cookieDomain } = getConfig()
  const value: Consent = { v: 1, analytics, ts: Date.now() }
  document.cookie = [
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}`,
    "Path=/",
    `Max-Age=${SIX_MONTHS}`,
    "SameSite=Lax",
    cookieDomain && `Domain=${cookieDomain}`,
    location.protocol === "https:" && "Secure",
  ]
    .filter(Boolean)
    .join("; ")

  if (!analytics) removeTrackingCookies(cookieDomain)
  for (const listener of listeners) listener()
}

function removeTrackingCookies(domain?: string) {
  for (const name of ["_fbp", "_fbc"]) {
    document.cookie = `${name}=; Path=/; Max-Age=0`
    if (domain)
      document.cookie = `${name}=; Path=/; Max-Age=0; Domain=${domain}`
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useConsent(): Consent | null {
  return useSyncExternalStore(subscribe, readConsent, () => null)
}
