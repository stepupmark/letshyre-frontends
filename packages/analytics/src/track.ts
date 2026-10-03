import {
  type EventParams,
  loadMetaPixel,
  metaPageView,
  metaTrack,
  type StandardEvent,
} from "./adapters/meta-pixel.ts"
import { getConfig } from "./config.ts"
import { readConsent } from "./consent.ts"

/** True only in production, with an id, after the visitor said yes (when consent is required). */
export function canTrack(): boolean {
  const { enabled, requireConsent, metaPixelId } = getConfig()
  if (!enabled || !metaPixelId || typeof window === "undefined") return false
  return !requireConsent || readConsent()?.analytics === true
}

function ready() {
  if (!canTrack()) return false
  loadMetaPixel(getConfig().metaPixelId ?? "")
  return true
}

/** Call on every navigation, with the pathname only (no query strings, no ids). */
export function pageView() {
  if (ready()) metaPageView()
}

/** `eventId` lets Meta drop repeats, e.g. a reloaded confirmation page. */
export function track(
  event: StandardEvent,
  params: EventParams = {},
  eventId?: string
) {
  if (ready()) metaTrack(event, params, eventId)
}
