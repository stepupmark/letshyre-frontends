const SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js"

/** Meta's standard events. Custom events are left out on purpose. */
export type StandardEvent =
  | "Lead"
  | "Contact"
  | "CompleteRegistration"
  | "Subscribe"
  | "StartTrial"
  | "SubmitApplication"
  | "Schedule"
  | "ViewContent"
  | "Search"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"

/** No PII: these are the only params that ever leave the browser. */
export interface EventParams {
  value?: number
  currency?: string
  content_name?: string
  content_category?: string
  content_ids?: string[]
  num_items?: number
}

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue: unknown[][]
  push: Fbq
  loaded: boolean
  version: string
  disablePushState: boolean
  allowDuplicatePageViews: boolean
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

/** Meta's base code, unminified. */
export function loadMetaPixel(id: string) {
  if (window.fbq) return

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue.push(args)
  } as Fbq
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = "2.0"
  fbq.queue = []
  // we send PageViews ourselves; without this the pixel adds one per pushState
  fbq.disablePushState = true
  fbq.allowDuplicatePageViews = true
  window.fbq = fbq
  window._fbq ??= fbq

  const script = document.createElement("script")
  script.async = true
  script.src = SCRIPT_SRC
  document.head.appendChild(script)

  fbq("set", "autoConfig", false, id)
  fbq("init", id)
}

export function metaPageView() {
  window.fbq?.("track", "PageView")
}

export function metaTrack(
  name: StandardEvent,
  params: EventParams,
  eventId?: string
) {
  window.fbq?.(
    "track",
    name,
    params,
    eventId ? { eventID: eventId } : undefined
  )
}
