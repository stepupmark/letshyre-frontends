import type { DesktopOs } from "@workspace/api/public"

const DESKTOP_OSES = ["windows", "mac"] as const satisfies DesktopOs[]

export type DetectedOs = DesktopOs | "other"

export interface NavigatorLike {
  userAgent: string
  maxTouchPoints?: number
  userAgentData?: { platform?: string; mobile?: boolean }
}

/** Phones, tablets and Linux come back as "other": there's no build for them. */
export function detectOs(nav: NavigatorLike): DetectedOs {
  const hints = nav.userAgentData
  if (hints?.platform) {
    if (hints.mobile) return "other"
    const platform = hints.platform.toLowerCase()
    if (platform.includes("win")) return "windows"
    if (platform.includes("mac")) return "mac"
    return "other"
  }

  const ua = nav.userAgent.toLowerCase()
  if (/android|iphone|ipad|ipod|mobile/.test(ua)) return "other"
  if (ua.includes("windows")) return "windows"
  if (ua.includes("macintosh") || ua.includes("mac os")) {
    // iPadOS asks for the desktop site and reports itself as a Mac
    return (nav.maxTouchPoints ?? 0) > 1 ? "other" : "mac"
  }
  return "other"
}

/** Detected OS first, so the visitor's own download leads. */
export function orderForDevice(detected: DetectedOs | null): DesktopOs[] {
  return [...DESKTOP_OSES].sort(
    (a, b) => Number(b === detected) - Number(a === detected)
  )
}
